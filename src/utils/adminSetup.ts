
export const createAdminAccount = async () => {
  try {
    console.log('Creating admin account in localStorage...');
    
    // Check if admin already exists
    const savedUsers = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
    const existingAdmin = savedUsers.find((u: any) => u.email === 'id.arvinstudio@gmail.com');

    if (existingAdmin) {
      console.log('Admin account already exists');
      return { success: true, message: 'Admin account already exists' };
    }

    // Create admin user
    const adminUser = {
      id: 'admin-001',
      email: 'id.arvinstudio@gmail.com',
      password: 'admin123!@#',
      name: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    savedUsers.push(adminUser);
    localStorage.setItem('dailywork_users', JSON.stringify(savedUsers));

    console.log('Admin account created successfully');
    return { success: true, message: 'Admin account created successfully' };
  } catch (error) {
    console.error('Error in createAdminAccount:', error);
    return { success: false, error: 'Failed to create admin account' };
  }
};
