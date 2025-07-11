import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    // Actualizar perfil básico
    const updatedUser = await UserService.updateProfile(user.id, {
      name,
      email,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    // Actualizar contraseña si se proporciona
    if (currentPassword && newPassword) {
      const validUser = await UserService.verifyPassword(
        user.email,
        currentPassword
      );
      if (!validUser) {
        return NextResponse.json(
          { error: 'Contraseña actual incorrecta' },
          { status: 400 }
        );
      }

      const passwordUpdated = await UserService.updatePassword(
        user.id,
        newPassword
      );
      if (!passwordUpdated) {
        return NextResponse.json(
          { error: 'Error al actualizar la contraseña' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
