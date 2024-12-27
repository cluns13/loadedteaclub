import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'
import { createTeaSchema } from '@/lib/validations/tea'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = {
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [teas, total] = await Promise.all([
      prisma.tea.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              reviews: true,
              favoritedBy: true,
            },
          },
        },
      }),
      prisma.tea.count({ where }),
    ])

    return successResponse({
      teas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching teas:', error)
    return errorResponse('Failed to fetch teas')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse('Unauthorized', 401)
    }

    const json = await request.json()
    const validatedData = createTeaSchema.safeParse(json)

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const tea = await prisma.tea.create({
      data: {
        name: validatedData.data.name,
        type: validatedData.data.type,
        description: validatedData.data.description,
        benefits: validatedData.data.benefits,
        temperature: validatedData.data.temperature,
        steepTime: validatedData.data.steepTime,
        servingSize: validatedData.data.servingSize,
        waterAmount: validatedData.data.waterAmount,
        origin: validatedData.data.origin,
        imageUrl: validatedData.data.imageUrl,
        price: validatedData.data.price,
        stock: validatedData.data.stock,
        resteeps: validatedData.data.resteeps,
      },
    })

    return successResponse(tea)
  } catch (error) {
    console.error('Error creating tea:', error)
    return errorResponse('Failed to create tea')
  }
}
