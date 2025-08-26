/**
 * Utility functions for formatting cooking instructions
 */

export interface FormattedInstruction {
  step: number;
  content: string;
  isSubStep?: boolean;
}

export function formatInstructions(rawInstructions: string): string {
  if (!rawInstructions) return '';

  let formatted = rawInstructions;

  // Clean up common formatting issues
  formatted = formatted
    // Remove extra whitespace and normalize line breaks
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Handle numbered steps (1., 2., etc.)
  formatted = formatted.replace(/(\d+\.)\s*/g, '\n$1 ');

  // Handle bullet points
  formatted = formatted.replace(/(\*|\-)\s*/g, '\n• ');

  // Handle bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle italic text
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Split into paragraphs and format
  const paragraphs = formatted.split('\n').filter(p => p.trim());
  
  const formattedParagraphs = paragraphs.map((paragraph, index) => {
    const trimmed = paragraph.trim();
    
    // If it's a numbered step
    if (/^\d+\./.test(trimmed)) {
      return `<div class="instruction-step"><strong>${trimmed}</strong></div>`;
    }
    
    // If it's a bullet point
    if (/^•/.test(trimmed)) {
      return `<div class="instruction-bullet">${trimmed}</div>`;
    }
    
    // If it's a section header (all caps or ends with colon)
    if (/^[A-Z\s]+:$/.test(trimmed) || trimmed.endsWith(':')) {
      return `<div class="instruction-header"><strong>${trimmed}</strong></div>`;
    }
    
    // Regular paragraph
    return `<div class="instruction-paragraph">${trimmed}</div>`;
  });

  return formattedParagraphs.join('\n');
}

export function extractSteps(rawInstructions: string): FormattedInstruction[] {
  if (!rawInstructions) return [];

  const steps: FormattedInstruction[] = [];
  const lines = rawInstructions.split('\n').filter(line => line.trim());
  
  let currentStep = 0;
  let currentSubStep = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check if it's a numbered step
    const stepMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
    if (stepMatch) {
      currentStep = parseInt(stepMatch[1]);
      currentSubStep = 0;
      steps.push({
        step: currentStep,
        content: stepMatch[2].trim()
      });
      return;
    }

    // Check if it's a bullet point or sub-step
    if (/^[•\-\*]\s/.test(trimmed)) {
      currentSubStep++;
      steps.push({
        step: currentStep,
        content: trimmed.replace(/^[•\-\*]\s/, ''),
        isSubStep: true
      });
      return;
    }

    // If it's a section header
    if (/^[A-Z\s]+:$/.test(trimmed) || trimmed.endsWith(':')) {
      steps.push({
        step: currentStep + 1,
        content: trimmed,
        isSubStep: false
      });
      currentStep++;
      return;
    }

    // Regular content - append to previous step or create new one
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      lastStep.content += ' ' + trimmed;
    } else {
      steps.push({
        step: 1,
        content: trimmed
      });
    }
  });

  return steps;
}

export function formatInstructionsForDisplay(rawInstructions: string): string {
  const steps = extractSteps(rawInstructions);
  
  if (steps.length === 0) {
    return formatInstructions(rawInstructions);
  }

  const formattedSteps = steps.map(step => {
    if (step.isSubStep) {
      return `<div class="instruction-substep">• ${step.content}</div>`;
    }
    return `<div class="instruction-step"><strong>${step.step}.</strong> ${step.content}</div>`;
  });

  return formattedSteps.join('\n');
} 