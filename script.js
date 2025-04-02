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
    
    // When "Not sure yet" is checked, uncheck all other options - using change event instead of click
    stageNA.addEventListener('change', function() {
        if (this.checked) {
            regularStageCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    });
    
    // When any other option is checked, uncheck "Not sure yet" - using change event instead of click
    regularStageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                stageNA.checked = false;
            }
        });
    });
    
    // Set up checkbox toggle functionality for "Not applicable" option in focus areas
    const focusNA = document.getElementById('focus-na');
    const regularFocusCheckboxes = Array.from(document.querySelectorAll('input[name="focus"]'))
        .filter(checkbox => checkbox.id !== 'focus-na');
    
    // When "Not applicable" is checked, uncheck all other options - using change event instead of click
    focusNA.addEventListener('change', function() {
        if (this.checked) {
            regularFocusCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    });
    
    // When any other option is checked, uncheck "Not applicable" - using change event instead of click
    regularFocusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
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
                alert('Please fill in all required fields.');
                return;
            }
            
            const generatedPrompt = generatePrompt(formData);
            console.log("Generated prompt:", generatedPrompt);
            promptText.textContent = generatedPrompt;
            resultSection.style.display = 'block';
            
            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error generating prompt:", error);
            alert("There was an error generating your prompt: " + error.message);
        }
    });
    
    // Copy prompt to clipboard
    copyButton.addEventListener('click', function() {
        try {
            navigator.clipboard.writeText(promptText.textContent)
                .then(() => {
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy to clipboard');
                });
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            alert("There was an error copying to clipboard. You may need to select and copy the text manually.");
        }
    });
    
    // Download as PDF - FIXED jsPDF reference
    downloadButton.addEventListener('click', function() {
        try {
            // Check if jsPDF is available - FIXED to use correct object path
            if (typeof window.jspdf === 'undefined') {
                throw new Error('PDF generation library not loaded');
            }
            
            // FIXED: Correct way to access jsPDF constructor
            const jsPDF = window.jspdf.jsPDF;
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
            alert("There was an error generating the PDF: " + error.message);
        }
    });
    
    // Reset form
    resetButton.addEventListener('click', function() {
        form.reset();
        resultSection.style.display = 'none';
    });
    
    /**
     * Collects all form data into an object
     * @returns {Object} Form data
     */
    function getFormData() {
        const professorName = document.getElementById('professor-name').value;
        const course = document.getElementById('course').value;
        const assignmentType = document.getElementById('assignment-type').value;
        const assignmentDescription = document.getElementById('assignment-description').value;
        const learningObjectives = document.getElementById('learning-objectives').value;
        const studentChallenges = document.getElementById('student-challenges').value;
        
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
                const otherText = document.getElementById('help-other-text').value;
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
        
        const additionalNotes = document.getElementById('additional-notes').value;
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
    
    /**
     * Validates form data to ensure required fields are filled
     * @param {Object} data - Form data
     * @returns {boolean} Is form valid
     */
    function validateForm(data) {
        console.log("Validating form data:", data);
        
        // Check required fields
        const requiredFieldsValid = data.course && data.assignmentType && data.learningObjectives && 
            data.aiFormat && data.structureLevel && data.aiTool;
        console.log("Required fields valid:", requiredFieldsValid);
        
        // Check if at least one stage is selected or "Not sure yet" is checked
        const stagesValid = data.stages.length > 0 || document.getElementById('stage-na').checked;
        console.log("Stages valid:", stagesValid);
        
        // Check if at least one help type is selected
        const helpTypesValid = data.helpTypes.length > 0;
        console.log("Help types valid:", helpTypesValid);
        
        // Check if at least one focus area is selected or "Not applicable" is checked
        const focusAreasValid = data.focusAreas.length > 0 || document.getElementById('focus-na').checked;
        console.log("Focus areas valid:", focusAreasValid);
        
        const isValid = requiredFieldsValid && stagesValid && helpTypesValid && focusAreasValid;
        console.log("Form is valid:", isValid);
        
        if (!requiredFieldsValid) {
            alert("Please fill in all required fields (Course, Assignment Type, Learning Objectives, AI Format, Structure Level, and AI Tool).");
            return false;
        }
        
        if (!stagesValid) {
            alert("Please select at least one stage or check 'Not sure yet'.");
            return false;
        }
        
        if (!helpTypesValid) {
            alert("Please select at least one help type.");
            return false;
        }
        
        if (!focusAreasValid) {
            alert("Please select at least one focus area or check 'Not applicable'.");
            return false;
        }
        
        return isValid;
    }
    
    /**
     * Generates the AI prompt based on form data
     * @param {Object} data - Form data
     * @returns {string} Generated prompt
     */
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
            
            // Convert stage values to their corresponding labels
            const stageNames = data.stages.map(stage => stageLabels[stage] || stage);
            
            // Join with commas, and 'and' for the last item if there are multiple
            let stageText = '';
            if (stageNames.length === 1) {
                stageText = stageNames[0];
            } else if (stageNames.length === 2) {
                stageText = stageNames.join(' and ');
            } else {
                const lastStage = stageNames.pop();
                stageText = stageNames.join(', ') + ', and ' + lastStage;
            }
            
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
        
        // Convert help values to their corresponding labels
        const helpNames = data.helpTypes.map(help => helpLabels[help] || help);
        
        // Join with commas, and 'and' for the last item if there are multiple
        let helpText = '';
        if (helpNames.length === 1) {
            helpText = helpNames[0];
        } else if (helpNames.length === 2) {
            helpText = helpNames.join(' and ');
        } else {
            const lastHelp = helpNames.pop();
            helpText = helpNames.join(', ') + ', and ' + lastHelp;
        }
        
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
            
            // Convert focus values to their corresponding labels
            const focusNames = data.focusAreas.map(focus => focusLabels[focus] || focus);
            
            // Join with commas, and 'and' for the last item if there are multiple
            let focusText = '';
            if (focusNames.length === 1) {
                focusText = focusNames[0];
            } else if (focusNames.length === 2) {
                focusText = focusNames.join(' and ');
            } else {
                const lastFocus = focusNames.pop();
                focusText = focusNames.join(', ') + ', and ' + lastFocus;
            }
            
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
});
