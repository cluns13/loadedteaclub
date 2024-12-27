import { Resend } from 'resend';
import { LoadedTeaRewardsService } from './rewardsService';
import { getUserById } from './userService';

const resend = new Resend(process.env.RESEND_API_KEY);

export class LoadedTeaNotificationService {
  static async notifyFreeLoadedTeaEligibility(userId: string) {
    const user = await getUserById(userId);
    const rewards = await LoadedTeaRewardsService.getUserLoadedTeaRewards(userId);

    if (!user || !rewards) return;

    await resend.emails.send({
      from: 'Loaded Tea Rewards <rewards@yourapp.com>',
      to: user.email,
      subject: 'You\'ve Earned a Free Loaded Tea! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Congratulations, ${user.name}!</h1>
          <p>You've reached 5 loaded tea purchases and earned a FREE loaded tea!</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <strong>Your Reward:</strong> One complimentary loaded tea
            <br>
            <small>Redeem at any participating nutrition club</small>
          </div>
          <a href="/profile/rewards" style="
            display: inline-block; 
            background-color: #your-primary-color; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px;
            margin-top: 15px;
          ">
            View Your Rewards
          </a>
        </div>
      `
    });
  }

  static async notifyLoadedTeaPurchase(userId: string, loadedTeaName: string) {
    const user = await getUserById(userId);
    const rewards = await LoadedTeaRewardsService.getUserLoadedTeaRewards(userId);

    if (!user || !rewards) return;

    const remainingForFree = 5 - (rewards.loadedTeaPurchases % 5);

    await resend.emails.send({
      from: 'Loaded Tea Rewards <rewards@yourapp.com>',
      to: user.email,
      subject: 'Thanks for Your Loaded Tea Purchase! 🍵',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Enjoy Your ${loadedTeaName}!</h1>
          <p>You're making progress on your free loaded tea reward!</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <strong>Progress:</strong> ${rewards.loadedTeaPurchases} loaded teas purchased
            <br>
            <small>${remainingForFree} more loaded teas until your next free drink</small>
          </div>
          <a href="/profile/rewards" style="
            display: inline-block; 
            background-color: #your-primary-color; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px;
            margin-top: 15px;
          ">
            Check Your Rewards
          </a>
        </div>
      `
    });
  }
}
