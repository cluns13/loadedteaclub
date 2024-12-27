import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'
import { createCollectionSchema } from '@/lib/validations/tea'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { isPublic: true },
        ...(session?.user ? [{ userId: session.user.id }] : []),
      ],
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              teas: true,
            },
          },
        },
      }),
      prisma.collection.count({ where }),
    ])

    return successResponse({
      collections,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return errorResponse('Failed to fetch collections')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse('Unauthorized', 401)
    }

    const json = await request.json()
    const validatedData = createCollectionSchema.safeParse(json)

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const { teas, ...data } = validatedData.data

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        isPublic: data.isPublic ?? false,
        user: {
          connect: {
            id: session.user.id
          }
        },
        ...(teas && {
          teas: {
            connect: teas.map((id) => ({ id })),
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            teas: true,
          },
        },
      },
    })

    return successResponse(collection)
  } catch (error) {
    console.error('Error creating collection:', error)
    return errorResponse('Failed to create collection')
  }
}
