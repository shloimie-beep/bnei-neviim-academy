import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  const email = 'admin';
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const existing = await db.select().from(users).where(eq(users.email, email));
  
  if (existing.length > 0) {
    await db.update(users).set({ 
      password: hashedPassword,
      role: 'admin'
    }).where(eq(users.email, email));
    console.log('Admin user updated: admin / password');
  } else {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      role: 'admin',
      subscriptionStatus: 'active',
    });
    console.log('Admin user created: admin / password');
  }
  
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
