import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'
import { createReviewSchema } from '@/lib/validations/tea'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '@/lib/api/response'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse('Unauthorized', 401)
    }

    const json = await request.json()
    const validatedData = createReviewSchema.safeParse({
      ...json,
      teaId: params.id,
    })

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        teaId: params.id,
        userId: session.user.id,
      },
    })

    if (existingReview) {
      return errorResponse('You have already reviewed this tea')
    }

    const review = await prisma.review.create({
      data: {
        rating: validatedData.data.rating,
        comment: validatedData.data.comment,
        user: {
          connect: {
            id: session.user.id
          }
        },
        tea: {
          connect: {
            id: params.id
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return successResponse(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return errorResponse('Failed to create review')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { teaId: params.id },
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
        },
      }),
      prisma.review.count({
        where: { teaId: params.id },
      }),
    ])

    return successResponse({
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return errorResponse('Failed to fetch reviews')
  }
}
