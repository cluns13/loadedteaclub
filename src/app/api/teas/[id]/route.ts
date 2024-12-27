import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth/auth'
import { updateTeaSchema } from '@/lib/validations/tea'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tea = await prisma.tea.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            favoritedBy: true,
          },
        },
      },
    })

    if (!tea) {
      return errorResponse('Tea not found', 404)
    }

    return successResponse(tea)
  } catch (error) {
    console.error('Error fetching tea:', error)
    return errorResponse('Failed to fetch tea')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse('Unauthorized', 401)
    }

    const json = await request.json()
    const validatedData = updateTeaSchema.safeParse(json)

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const tea = await prisma.tea.update({
      where: { id: params.id },
      data: validatedData.data,
    })

    return successResponse(tea)
  } catch (error) {
    console.error('Error updating tea:', error)
    return errorResponse('Failed to update tea')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse('Unauthorized', 401)
    }

    await prisma.tea.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Tea deleted successfully' })
  } catch (error) {
    console.error('Error deleting tea:', error)
    return errorResponse('Failed to delete tea')
  }
}
