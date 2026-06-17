import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Endpoint temporal para crear admin
// POST /api/create-admin
// Body: { email: string, name: string, password: string, cedula: string, parentesco?: string }

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, cedula, parentesco } = await request.json()

    if (!email || !name || !password || !cedula) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (email, name, password, cedula)' },
        { status: 400 }
      )
    }

    // Verificar si ya existe por email
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar si ya existe por cédula
    const existingCedula = await prisma.user.findUnique({ where: { cedula } })
    if (existingCedula) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con esa cédula' },
        { status: 400 }
      )
    }

    // Crear usuario admin
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        cedula,
        parentesco: parentesco || null,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Admin creado: ${user.email}`,
      user: { id: user.id, email: user.email, name: user.name, cedula: user.cedula, role: user.role }
    })
  } catch (error) {
    console.error('Error creando admin:', error)
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
