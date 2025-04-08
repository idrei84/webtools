document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const form = document.getElementById('aiPlanningForm');
    const formContent = document.querySelector('.form-content');
    const outputContainer = document.getElementById('outputContainer');
    const promptOutput = document.getElementById('promptOutput');
    
    // Buttons
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    const downloadTextBtn = document.getElementById('downloadTextBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    
    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const formDataObj = Object.fromEntries(formData.entries());
        
        // Generate the prompt
        const generatedPrompt = generatePrompt(formDataObj);
        
        // Display the prompt
        promptOutput.textContent = generatedPrompt;
        
        // Show the output container
        formContent.style.display = 'none';
        outputContainer.classList.remove('hidden');
        
        // Scroll to top
        window.scrollTo(0, 0);
    });
    
    // Copy to clipboard
    copyToClipboardBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(promptOutput.textContent)
            .then(() => {
                alert('Prompt copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy. Please select and copy the text manually.');
            });
    });
    
    // Download as text
    downloadTextBtn.addEventListener('click', () => {
        const text = promptOutput.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AI_Integration_Prompt.txt';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Download as PDF
    downloadPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set title
        doc.setFontSize(16);
        doc.text('AI Integration Planning Prompt', 20, 20);
        
        // Add text content with line wrapping
        doc.setFontSize(12);
        const textLines = doc.splitTextToSize(promptOutput.textContent, 170);
        doc.text(textLines, 20, 30);
        
        // Save PDF
        doc.save('AI_Integration_Prompt.pdf');
    });
    
    // Go back to form
    backToFormBtn.addEventListener('click', () => {
        outputContainer.classList.add('hidden');
        formContent.style.display = 'block';
    });
    
    // Generate prompt based on form data
    function generatePrompt(data) {
        return `AI Integration Planning Prompt for Faculty

Hello! I am ${data.instructorName} from the ${data.department} department. I'm teaching ${data.courseName} (${data.courseNumber}) and looking to thoughtfully integrate AI assistance into one of my assignments.

ASSIGNMENT DETAILS:
- Title: ${data.assignmentTitle}
- Type: ${data.assignmentType}
- Description: ${data.assignmentDescription}
- Learning Objectives: ${data.learningObjectives}
- Current Challenges: ${data.currentChallenges}

CORE REQUIREMENTS:
- Skills students must develop: ${data.keySkills}
- Components students must complete independently: ${data.independentWork}

I want to explore how AI tools could enhance this assignment without replacing critical thinking and skills development. Let's approach this step by step:

STEP 1: Please identify 2-3 specific ways AI could support students with this assignment while ensuring they still develop the necessary skills. After you provide these ideas, I'll respond with my thoughts before we move to the next step.

Once we complete Step 1, we'll:
- STEP 2: Narrow down and select the best AI integration idea
- STEP 3: Draft a VERBATIM prompt template for students to copy-paste when using AI tools (ChatGPT, Claude, etc.)
- STEP 4: Develop guidelines for ethical and effective AI use

Let's start with Step 1. What are 2-3 ways AI could enhance this assignment?`;
    }
});
