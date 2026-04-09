import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { z } from 'zod';

// Esquema de validación
const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos con safeParse (recomendado)
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      // Obtener el primer error usando issues
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const { name, email, phone, message } = validatedData;

    // Enviar email al administrador
    const { data, error: emailError } = await resend.emails.send({
      from: `CC Reparaciones Móviles <${process.env.EMAIL_FROM}>`,
      to: [process.env.EMAIL_ADMIN!],
      subject: `Nuevo mensaje de contacto - ${name}`,
      replyTo: email,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo mensaje de contacto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0A2B4E; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #0A2B4E; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📬 Nuevo mensaje de contacto</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nombre:</div>
                <div class="value">${escapeHtml(name)}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value">${escapeHtml(email)}</div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">📱 Teléfono:</div>
                <div class="value">${escapeHtml(phone)}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">💬 Mensaje:</div>
                <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>Este mensaje fue enviado desde el formulario de contacto de CC Reparaciones Móviles</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nuevo mensaje de contacto:

Nombre: ${name}
Email: ${email}
${phone ? `Teléfono: ${phone}\n` : ''}
Mensaje:
${message}
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { error: 'Error al enviar el mensaje' },
        { status: 500 }
      );
    }

    // Enviar email de confirmación al usuario
    await resend.emails.send({
      from: `CC Reparaciones Móviles <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: 'Recibimos tu mensaje - CC Reparaciones Móviles',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de contacto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0A2B4E; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ ¡Hola ${escapeHtml(name)}!</h2>
            </div>
            <div class="content">
              <p>Hemos recibido tu mensaje correctamente. Nos pondremos en contacto contigo a la brevedad.</p>
              <p><strong>Resumen de tu mensaje:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                ${escapeHtml(message).replace(/\n/g, '<br>')}
              </div>
              <p>Mientras tanto, puedes visitar nuestro catálogo o agendar una reparación directamente por WhatsApp.</p>
              <div style="text-align: center;">
                <a href="https://wa.me/521234567890" class="button" style="color: white;">📱 Contactar por WhatsApp</a>
              </div>
            </div>
            <div class="footer">
              <p>CC Reparaciones Móviles | Expertos en reparación y venta de celulares</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json(
      { success: true, message: 'Mensaje enviado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 }
    );
  }
}

// Función helper para sanitizar HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}