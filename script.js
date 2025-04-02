document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('prompt-form');
    const generateButton = document.getElementById('generate-button');
    const resetButton = document.getElementById('reset-button');
    const copyButton = document.getElementById('copy-button');
    const downloadButton = document.getElementById('download-button');
    const resultSection = document.getElementById('result-section');
    const promptText = document.getElementById('prompt-text');
    
    // Set up checkbox toggle functionality for "Not sure yet" option in stages
    const stageNA = document.getElementById('stage-na');
    const regularStageCheckboxes = Array.from(document.querySelectorAll('input[name="stage"]'))
        .filter(checkbox => checkbox.id !== 'stage-na');
    
    // When "Not sure yet" is checked, disable and uncheck all other options
    stageNA.addEventListener('change', function() {
        if (this.checked) {
            regularStageCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
        } else {
            regularStageCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
        }
    });
    
    // When any other option is checked, disable "Not sure yet"
    regularStageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const anyRegularChecked = regularStageCheckboxes.some(cb => cb.checked);
            stageNA.disabled = anyRegularChecked;
            if (anyRegularChecked) {
                stageNA.checked = false;
            }
        });
    });
    
    // Set up checkbox toggle functionality for "Not applicable" option in focus areas
    const focusNA = document.getElementById('focus-na');
    const regularFocusCheckboxes = Array.from(document.querySelectorAll('input[name="focus"]'))
        .filter(checkbox => checkbox.id !== 'focus-na');
    
    // When "Not applicable" is checked, disable and uncheck all other options
    focusNA.addEventListener('change', function() {
        if (this.checked) {
            regularFocusCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
        } else {
            regularFocusCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
        }
    });
    
    // When any other option is checked, disable "Not applicable"
    regularFocusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const anyRegularChecked = regularFocusCheckboxes.some(cb => cb.checked);
            focusNA.disabled = anyRegularChecked;
            if (anyRegularChecked) {
                focusNA.checked = false;
            }
        });
    });
    
    // Generate prompt when button is clicked
    generateButton.addEventListener('click', function() {
        try {
            console.log("Generate button clicked");
            const formData = getFormData();
            console.log("Form data collected:", formData);
            
            if (!validateForm(formData)) {
                return; // validateForm now handles its own alerts
            }
            
            const generatedPrompt = generatePrompt(formData);
            console.log("Generated prompt:", generatedPrompt);
            
            // Display the generated prompt
            promptText.textContent = generatedPrompt;
            resultSection.style.display = 'block';
            
            // Scroll to results with smooth animation
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error("Error generating prompt:", error);
            alert("There was an error generating your prompt. Please try again.");
        }
    });
    
    // Copy prompt to clipboard
    copyButton.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(promptText.textContent);
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            alert("Unable to copy to clipboard. Please select and copy the text manually.");
        }
    });
    
    // Download as PDF
    downloadButton.addEventListener('click', function() {
        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('PDF generation library not loaded');
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const professorName = document.getElementById('professor-name').value || 'Professor';
            const courseName = document.getElementById('course').value || 'Course';
            
            doc.setFontSize(16);
            doc.text('AI Prompt for Communication Classes', 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Professor: ${professorName}`, 20, 30);
            doc.text(`Course: ${courseName}`, 20, 40);
            
            doc.setFontSize(14);
            doc.text('Prompt:', 20, 55);
            
            const textLines = doc.splitTextToSize(promptText.textContent, 170);
            doc.setFontSize(10);
            doc.text(textLines, 20, 65);
            
            const filename = `AI_Prompt_${courseName.replace(/\s+/g, '_')}.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Unable to generate PDF. Please ensure you have a stable internet connection and try again.");
        }
    });
    
    // Reset form with confirmation
    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            form.reset();
            resultSection.style.display = 'none';
            
            // Re-enable all checkboxes after reset
            regularStageCheckboxes.forEach(checkbox => checkbox.disabled = false);
            regularFocusCheckboxes.forEach(checkbox => checkbox.disabled = false);
            stageNA.disabled = false;
            focusNA.disabled = false;
        }
    });
    
    function getFormData() {
        const professorName = document.getElementById('professor-name').value.trim();
        const course = document.getElementById('course').value.trim();
        const assignmentType = document.getElementById('assignment-type').value;
        const assignmentDescription = document.getElementById('assignment-description').value.trim();
        const learningObjectives = document.getElementById('learning-objectives').value.trim();
        const studentChallenges = document.getElementById('student-challenges').value.trim();
        
        // Get stages
        const stages = [];
        if (!document.getElementById('stage-na').checked) {
            regularStageCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    stages.push(checkbox.value);
                }
            });
        }
        
        // Get help types
        const helpTypes = [];
        document.querySelectorAll('input[name="help"]:checked').forEach(checkbox => {
            if (checkbox.id === 'help-other') {
                const otherText = document.getElementById('help-other-text').value.trim();
                if (otherText) {
                    helpTypes.push(otherText);
                }
            } else {
                helpTypes.push(checkbox.value);
            }
        });
        
        const aiFormat = document.getElementById('ai-format').value;
        const structureLevel = document.getElementById('structure-level').value;
        
        // Get focus areas
        const focusAreas = [];
        if (!document.getElementById('focus-na').checked) {
            regularFocusCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    focusAreas.push(checkbox.value);
                }
            });
        }
        
        const additionalNotes = document.getElementById('additional-notes').value.trim();
        const aiTool = document.getElementById('ai-tool').value;
        const promptType = document.querySelector('input[name="prompt-type"]:checked').value;
        
        return {
            professorName,
            course,
            assignmentType,
            assignmentDescription,
            learningObjectives,
            studentChallenges,
            stages,
            helpTypes,
            aiFormat,
            structureLevel,
            focusAreas,
            additionalNotes,
            aiTool,
            promptType
        };
    }
    
    function validateForm(data) {
        console.log("Validating form data:", data);
        
        // Check required fields
        const requiredFields = {
            course: 'Course Name/Number',
            assignmentType: 'Assignment Type',
            learningObjectives: 'Learning Objectives',
            aiFormat: 'Format of AI Assistance',
            structureLevel: 'Structure Level',
            aiTool: 'Primary AI Tool'
        };
        
        const missingFields = [];
        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!data[field]) {
                missingFields.push(label);
            }
        });
        
        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields:\n- ${missingFields.join('\n- ')}`);
            return false;
        }
        
        // Check stages
        const stagesValid = data.stages.length > 0 || document.getElementById('stage-na').checked;
        if (!stagesValid) {
            alert('Please select at least one stage or check "Not sure yet".');
            return false;
        }
        
        // Check help types
        if (data.helpTypes.length === 0) {
            alert('Please select at least one option for what AI should help with.');
            return false;
        }
        
        // Check focus areas
        const focusAreasValid = data.focusAreas.length > 0 || document.getElementById('focus-na').checked;
        if (!focusAreasValid) {
            alert('Please select at least one focus area or check "Not applicable".');
            return false;
        }
        
        return true;
    }
    
    function generatePrompt(data) {
        // Base prompt structure
        let prompt = `I am a professor teaching ${data.course} and I'm designing an ${data.assignmentType} assignment`;
        
        // Add assignment description if provided
        if (data.assignmentDescription) {
            prompt += ` where students will ${data.assignmentDescription}`;
        }
        
        prompt += ".\n\n";
        
        // Add learning objectives
        prompt += `The key learning objectives for this assignment are: ${data.learningObjectives}.\n\n`;
        
        // Add student challenges if provided
        if (data.studentChallenges) {
            prompt += `Students typically struggle with: ${data.studentChallenges}.\n\n`;
        }
        
        // Add stages information
        if (document.getElementById('stage-na').checked) {
            prompt += "I'm looking for suggestions on how students might use AI tools during different stages of this assignment.\n\n";
        } else {
            const stageLabels = {
                'brainstorming': 'brainstorming',
                'planning': 'planning/outlining',
                'drafting': 'drafting',
                'revising': 'revising/editing',
                'analyzing': 'analyzing/reflecting'
            };
            
            const stageNames = data.stages.map(stage => stageLabels[stage] || stage);
            const stageText = formatList(stageNames);
            
            prompt += `I want students to use AI specifically during the ${stageText} phase(s) of their work.\n\n`;
        }
        
        // Add what AI should help with
        const helpLabels = {
            'ideas': 'generating ideas',
            'structure': 'structuring content',
            'language': 'language improvement',
            'critical': 'critical thinking',
            'research': 'research guidance'
        };
        
        const helpNames = data.helpTypes.map(help => helpLabels[help] || help);
        const helpText = formatList(helpNames);
        
        prompt += `I want AI to help students with ${helpText}.\n\n`;
        
        // Add AI format
        const formatMap = {
            'in-class': 'in-class activities',
            'homework': 'homework support outside of class',
            'consultation': 'individual consultations during office hours',
            'flexible': 'flexibly based on their own needs'
        };
        prompt += `Students will be using AI for ${formatMap[data.aiFormat] || data.aiFormat}.\n\n`;
        
        // Add structure level
        const structureMap = {
            'high': 'highly structured, step-by-step guidance',
            'medium': 'moderate structure with some guidance',
            'low': 'minimal structure for open-ended exploration'
        };
        prompt += `Students will need ${structureMap[data.structureLevel] || data.structureLevel}.\n\n`;
        
        // Add focus areas if applicable
        if (!document.getElementById('focus-na').checked && data.focusAreas.length > 0) {
            const focusLabels = {
                'grammar': 'grammar',
                'vocabulary': 'vocabulary',
                'organization': 'organization',
                'content': 'content development',
                'citation': 'citation/references'
            };
            
            const focusNames = data.focusAreas.map(focus => focusLabels[focus] || focus);
            const focusText = formatList(focusNames);
            
            prompt += `The specific areas to focus on are: ${focusText}.\n\n`;
        }
        
        // Add additional notes if provided
        if (data.additionalNotes) {
            prompt += `Additional requirements or notes: ${data.additionalNotes}\n\n`;
        }
        
        // Request for different AI tools
        const toolSpecific = {
            'claude': 'I'll be using Claude for this, so please consider its strengths in your suggestions.',
            'chatgpt': 'I'll be using ChatGPT for this, so please consider its strengths in your suggestions.',
            'gemini': 'I'll be using Google Gemini for this, so please consider its strengths in your suggestions.',
            'copilot': 'I'll be using Microsoft Copilot for this, so please consider its strengths in your suggestions.',
            'any': 'I need prompts that would work well across different AI tools.'
        };
        
        prompt += toolSpecific[data.aiTool] || '';
        prompt += '\n\n';
        
        // Final request
        if (data.promptType === 'single') {
            prompt += 'Please help me create an effective prompt that students can use with AI tools for this assignment. Include clear instructions and guardrails that will guide students to use AI appropriately to enhance their learning rather than bypass it.';
        } else {
            prompt += 'Please help me create both an initial prompt and a follow-up prompt that students can use with AI tools for this assignment. The initial prompt should establish the context and main request, while the follow-up should help students engage more deeply or reflect on their process. Include clear instructions and guardrails that will guide students to use AI appropriately to enhance their learning rather than bypass it.';
        }
        
        return prompt;
    }

      // Helper function to format lists with proper grammar
    function formatList(items) {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;
        return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
    }
    
    // Add event listener for the "Other" help type text input
    const helpOtherCheckbox = document.getElementById('help-other');
    const helpOtherText = document.getElementById('help-other-text');
    
    helpOtherCheckbox.addEventListener('change', function() {
        helpOtherText.disabled = !this.checked;
        if (!this.checked) {
            helpOtherText.value = '';
        } else {
            helpOtherText.focus();
        }
    });
    
    // Initialize the "Other" help type text input state
    helpOtherText.disabled = !helpOtherCheckbox.checked;
    
    // Add input validation for the "Other" help type
    helpOtherText.addEventListener('input', function() {
        if (helpOtherCheckbox.checked && !this.value.trim()) {
            helpOtherCheckbox.checked = false;
            this.disabled = true;
        }
    });
});
