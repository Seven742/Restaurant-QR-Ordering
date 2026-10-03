import { handle, ok } from '@/lib/api';
import { SERVICE_FEE_PERCENT } from '@/lib/utils';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const rows = await query('SELECT restaurant_name, logo_url FROM settings WHERE id = 1');
  const settings = rows[0] || { restaurant_name: 'Restaurant Name', logo_url: '/logo.svg' };
  
  return ok({ 
    restaurantName: settings.restaurant_name, 
    logoUrl: settings.logo_url,
    serviceFeePercent: SERVICE_FEE_PERCENT 
  });
});

export const PATCH = handle(async (req) => {
  const body = await req.json();
  const { restaurantName, logoUrl } = body;
  
  await query(
    'UPDATE settings SET restaurant_name = ?, logo_url = ? WHERE id = 1',
    [restaurantName || 'Restaurant Name', logoUrl || '/logo.svg']
  );

  
  return ok({ success: true });
});
