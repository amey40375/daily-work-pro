
import { supabase } from '@/integrations/supabase/client';

export const createAdminAccount = async () => {
  try {
    // Check if admin already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'id.arvinstudio@gmail.com')
      .single();

    if (existingProfile) {
      console.log('Admin account already exists');
      return { success: true, message: 'Admin account already exists' };
    }

    // Create admin user via auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'id.arvinstudio@gmail.com',
      password: 'admin123!@#',
      options: {
        data: {
          full_name: 'Administrator',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return { success: false, error: authError.message };
    }

    console.log('Admin account created successfully');
    return { success: true, message: 'Admin account created successfully' };
  } catch (error) {
    console.error('Error in createAdminAccount:', error);
    return { success: false, error: 'Failed to create admin account' };
  }
};
