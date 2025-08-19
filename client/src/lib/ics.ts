export function generateICSFile(title: string, description: string, date: Date): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  // Sanitize inputs to prevent injection
  const sanitizedTitle = title.replace(/[^\w\s-]/g, '').substring(0, 100);
  const sanitizedDescription = description.replace(/[^\w\s.-]/g, '').substring(0, 200);

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pond0x Community Dashboard//EN
BEGIN:VEVENT
UID:pondpro-renewal-${Date.now()}@pond0xdash.com
DTSTAMP:${formatDate(new Date())}
DTSTART;VALUE=DATE:${formatDate(date).substring(0, 8)}
SUMMARY:${sanitizedTitle}
DESCRIPTION:${sanitizedDescription}
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

export function downloadICSFile(content: string, filename: string): void {
  try {
    // Use proper MIME type as recommended
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 200);
    
    console.log('ICS file download triggered:', filename);
  } catch (error) {
    console.error('Failed to download ICS file:', error);
    throw error;
  }
}

/**
 * Security note: This calendar export feature is safe because:
 * - User-initiated download (pull model, not push)
 * - Plain text content only (no HTML, attachments, or URLs)
 * - Client-side generation with input sanitization
 * - Proper MIME type and HTTPS delivery
 * - No auto-subscribe functionality
 */
