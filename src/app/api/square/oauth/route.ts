import { NextRequest, NextResponse } from 'next/server';
import { SquareService } from '@/lib/services/squareService';
import { NutritionClubService } from '@/lib/services/nutritionClubService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const clubId = searchParams.get('state'); // Using state for club identification

  if (!code || !clubId) {
    return NextResponse.redirect(new URL('/business/settings/rewards?error=invalid_request'));
  }

  try {
    const squareService = new SquareService();
    const nutritionClubService = new NutritionClubService();

    // Exchange code for tokens
    const { accessToken, refreshToken, merchantId } = await squareService.exchangeCodeForToken(code);

    // Update club with Square integration details
    await nutritionClubService.updateClubRewardsSettings(clubId, {
      rewardsEnabled: true,
      onlineOrderingAvailable: true,
      posIntegration: {
        provider: 'SQUARE',
        merchantId: merchantId
      }
    });

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL(`/business/settings/rewards?success=square_integration&merchantId=${merchantId}`)
    );

  } catch (error) {
    console.error('Square OAuth Error:', error);
    return NextResponse.redirect(
      new URL('/business/settings/rewards?error=oauth_failed')
    );
  }
}
