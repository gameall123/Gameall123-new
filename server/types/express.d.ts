declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      isAdmin: boolean;
      emailVerified: boolean;
      lastLoginAt: Date;
      createdAt: Date;
      updatedAt: Date;
      loginAttempts: number;
      lockUntil?: Date;
      phone?: string;
      bio?: string;
      profileImageUrl?: string;
      shippingAddress?: any;
      paymentMethod?: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
