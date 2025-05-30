document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init('5nilv_95RamRdxRq_');
    
    // DOM Elements
    const form = document.getElementById('agentForm');
    const previewButton = document.getElementById('previewButton');
    const generateButton = document.getElementById('generateButton');
    const emailButton = document.getElementById('emailButton');
    const resetButton = document.getElementById('resetButton');
    const previewModal = document.getElementById('previewModal');
    const promptPreview = document.getElementById('promptPreview');
    const closeButton = document.querySelector('.close-button');
    const closePreviewButton = document.getElementById('closePreview');
    const copyPromptButton = document.getElementById('copyPrompt');
    const downloadPromptButton = document.getElementById('downloadPrompt');
    
    // Store dropdown elements as global variables for use in multiple functions
    const disciplineSelect = document.getElementById('discipline');
    const otherDisciplineContainer = document.getElementById('otherDisciplineContainer');
    const courseLevelSelect = document.getElementById('courseLevel');
    const otherLevelContainer = document.getElementById('otherLevelContainer');
    const primaryFunctionSelect = document.getElementById('primaryFunction');
    const otherFunctionContainer = document.getElementById('otherFunctionContainer');
    const toneSelect = document.getElementById('tone');
    const customToneContainer = document.getElementById('customToneContainer');

    // Data persistence functions
    const STORAGE_KEY = 'aiTutorFormData';
    
    function saveFormData() {
        const formData = {};
        
        // Save all input, select, and textarea values
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.id] = input.value;
            }
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        showSaveIndicator();
    }
    
    function loadFormData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (!savedData) return;
            
            const formData = JSON.parse(savedData);
            
            // Restore all form values
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (!element) return;
                
                if (element.type === 'checkbox') {
                    element.checked = formData[key];
                } else if (element.type === 'radio') {
                    if (element.value === formData[key]) {
                        element.checked = true;
                    }
                } else {
                    element.value = formData[key];
                }
            });
            
            // Trigger change events to show/hide conditional fields
            disciplineSelect.dispatchEvent(new Event('change'));
            courseLevelSelect.dispatchEvent(new Event('change'));
            primaryFunctionSelect.dispatchEvent(new Event('change'));
            toneSelect.dispatchEvent(new Event('change'));
            
            // Handle syllabus toggle
            if (formData.includeSyllabus === 'yes') {
                syllabusSection.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    }
    
    function clearFormData() {
        localStorage.removeItem(STORAGE_KEY);
        hideSaveIndicator();
    }
    
    function showSaveIndicator() {
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.innerHTML = '💾 Form data saved automatically';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 0.9rem;
                z-index: 1001;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.opacity = '1';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            if (indicator) {
                indicator.style.opacity = '0';
            }
        }, 2000);
    }
    
    function hideSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }
    
    // Auto-save form data on input changes
    function setupAutoSave() {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', saveFormData);
            input.addEventListener('change', saveFormData);
        });
    }
    
    // Load saved data when page loads
    loadFormData();
    
    // "Other" option handlers
    setupOtherOptionHandlers();
    
    // Setup auto-save
    setupAutoSave();

    // Button event listeners
    previewButton.addEventListener('click', handlePreview);
    form.addEventListener('submit', handleGenerate);
    emailButton.addEventListener('click', handleEmail);
    closeButton.addEventListener('click', closeModal);
    closePreviewButton.addEventListener('click', closeModal);
    copyPromptButton.addEventListener('click', copyToClipboard);
    downloadPromptButton.addEventListener('click', downloadPrompt);
    
    // Add clear data button functionality (if you want to add a button for this)
    resetButton.addEventListener('click', function() {
        if (confirm('This will clear all form data and any saved progress. Are you sure?')) {
            clearFormData();
            form.reset();
            // Hide any conditional sections
            otherDisciplineContainer.classList.add('hidden');
            otherLevelContainer.classList.add('hidden');
            otherFunctionContainer.classList.add('hidden');
            customToneContainer.classList.add('hidden');
            syllabusSection.classList.add('hidden');
        }
    });
    
    // Handle syllabus toggle
    const includeSyllabusYes = document.getElementById('includeSyllabusYes');
    const includeSyllabusNo = document.getElementById('includeSyllabusNo');
    const syllabusSection = document.getElementById('syllabusSection');

    includeSyllabusYes.addEventListener('change', function() {
        if (this.checked) {
            syllabusSection.classList.remove('hidden');
        }
    });

    includeSyllabusNo.addEventListener('change', function() {
        if (this.checked) {
            syllabusSection.classList.add('hidden');
        }
    });
    
    // Handle "Other" option dropdowns
    function setupOtherOptionHandlers() {
        // Discipline dropdown
        disciplineSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherDisciplineContainer.classList.remove('hidden');
            } else {
                otherDisciplineContainer.classList.add('hidden');
            }
        });
        
        // Course level dropdown
        courseLevelSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherLevelContainer.classList.remove('hidden');
            } else {
                otherLevelContainer.classList.add('hidden');
            }
        });
        
        // Primary function dropdown
        primaryFunctionSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherFunctionContainer.classList.remove('hidden');
            } else {
                otherFunctionContainer.classList.add('hidden');
            }
        });
        
        // Tone dropdown
        toneSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customToneContainer.classList.remove('hidden');
            } else {
                customToneContainer.classList.add('hidden');
            }
        });
    }

    // Handle preview button click
    function handlePreview(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        const promptText = generatePromptText();
        promptPreview.textContent = promptText;
        previewModal.style.display = 'block';
    }

    // Handle generate button click
    function handleGenerate(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        const promptText = generatePromptText();
        downloadTextAsFile(promptText, 'ai-tutor-prompt.txt');
        
        // Optionally clear saved data after successful generation
        // clearFormData();
    }

    // Handle email
    async function handleEmail(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const email = document.getElementById('email').value.trim();
        console.log('Email value:', email); // Debug line
        
        if (!email) {
            alert('Please provide an email address to receive your prompt.');
            return;
        }
        
        try {
            const promptText = generatePromptText();
            const courseName = document.getElementById('courseName').value;
            const discipline = getDisciplineValue();
            const courseLevel = getCourseLevelValue();
            
            const templateParams = {
                to_email: email,
                course_name: courseName,
                discipline: discipline,
                course_level: courseLevel,
                prompt_content: promptText
            };
            
            console.log('Template params:', templateParams); // Debug line
            
            const result = await emailjs.send('service_kqxfaew', 'template_7aq11hk', templateParams);
            
            console.log('EmailJS result:', result); // Debug line
            alert('Email sent successfully! Check your inbox.');
            
            // Optionally clear saved data after successful email
            // clearFormData();
            
        } catch (error) {
            console.error('Email sending failed:', error);
            alert('Failed to send email: ' + (error.text || error.message || JSON.stringify(error)));
        }
    }
    
    // Close the modal
    function closeModal() {
        previewModal.style.display = 'none';
    }

    // Copy prompt to clipboard
    function copyToClipboard() {
        const promptText = promptPreview.textContent;
        navigator.clipboard.writeText(promptText)
            .then(() => {
                alert('Prompt copied to clipboard!');
            })
            .catch(err => {
                console.error('Error copying text: ', err);
                alert('Failed to copy to clipboard. Please try selecting and copying the text manually.');
            });
    }

    // Download prompt
    function downloadPrompt() {
        const promptText = promptPreview.textContent;
        downloadTextAsFile(promptText, 'ai-tutor-prompt.txt');
    }

    // Helper function to download text as a file
    function downloadTextAsFile(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Validate form inputs - FIXED: Remove email from required validation
    function validateForm() {
        // Get all required inputs EXCEPT email
        const requiredInputs = form.querySelectorAll('[required]:not(#email)');
        let isValid = true;

        // Clear all previous error messages
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        document.querySelectorAll('.invalid').forEach(input => input.classList.remove('invalid'));

        // Check each required input
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
                
                // Get the label text for this input
                const labelFor = document.querySelector(`label[for="${input.id}"]`);
                const labelText = labelFor ? labelFor.textContent : input.name;
                
                // Add error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = `Please fill out ${labelText.replace(':', '')}.`;
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '0.8rem';
                errorMsg.style.marginTop = '5px';
                input.parentNode.insertBefore(errorMsg, input.nextSibling);
            }
        });

        // Handle "other" options validation
        if (disciplineSelect.value === 'other' && !document.getElementById('otherDiscipline').value.trim()) {
            isValid = false;
            document.getElementById('otherDiscipline').classList.add('invalid');
            alert('Please specify your discipline in the "Other" field.');
        }
        
        if (courseLevelSelect.value === 'other' && !document.getElementById('otherLevel').value.trim()) {
            isValid = false;
            document.getElementById('otherLevel').classList.add('invalid');
            alert('Please specify your course level in the "Other" field.');
        }
        
        if (primaryFunctionSelect.value === 'other' && !document.getElementById('otherFunction').value.trim()) {
            isValid = false;
            document.getElementById('otherFunction').classList.add('invalid');
            alert('Please specify the primary function in the "Other" field.');
        }
        
        if (toneSelect.value === 'custom' && !document.getElementById('customTone').value.trim()) {
            isValid = false;
            document.getElementById('customTone').classList.add('invalid');
            alert('Please describe your custom tone in the "Other" field.');
        }

        return isValid;
    }

    // Process the syllabus input (either uploaded or pasted)
    function processSyllabusInput() {
        const includeSyllabusYes = document.getElementById('includeSyllabusYes');
        
        // Only process syllabus if "Yes" is selected
        if (!includeSyllabusYes.checked) {
            return {
                text: '',
                options: {
                    useForLearningOutcomes: false,
                    useForSchedule: false,
                    useForPolicies: false
                }
            };
        }
        
        const syllabusPaste = document.getElementById('syllabusPaste').value.trim();
        const useForLearningOutcomes = document.getElementById('useForLearningOutcomes').checked;
        const useForSchedule = document.getElementById('useForSchedule').checked;
        const useForPolicies = document.getElementById('useForPolicies').checked;
        
        let syllabusInfo = {
            text: syllabusPaste,
            options: {
                useForLearningOutcomes,
                useForSchedule,
                useForPolicies
            }
        };
        
        return syllabusInfo;
    }

    // Get syllabus usage description based on selected options
    function getSyllabusUsageDescription(syllabusInfo) {
        if (!syllabusInfo.text && !syllabusInfo.fileUploaded) {
            return '';
        }
        
        const options = [];
        if (syllabusInfo.options.useForLearningOutcomes) {
            options.push('reference the learning outcomes');
        }
        if (syllabusInfo.options.useForSchedule) {
            options.push('consider the course schedule and topics');
        }
        if (syllabusInfo.options.useForPolicies) {
            options.push('be aware of course policies');
        }
        
        if (options.length === 0) {
            return '';
        }
        
        return 'The agent should ' + options.join(', ') + ' from the syllabus.';
    }
    
    // Generate the prompt text based on form inputs - FIXED function calls
    function generatePromptText() {
        // Get all form values
        const discipline = getDisciplineValue();
        const courseLevel = getCourseLevelValue();
        const courseName = document.getElementById('courseName').value;
        const primaryFunction = getPrimaryFunctionValue();
        const learningOutcomes = document.getElementById('learningOutcomes').value;
        const studentNeeds = document.getElementById('studentNeeds').value;
        const alwaysDo = document.getElementById('alwaysDo').value;
        const neverDo = document.getElementById('neverDo').value;
        const sampleRequest = document.getElementById('sampleRequest').value;
        const responseApproach = document.getElementById('responseApproach').value;
        const tone = getToneValue();
        const flexibilityOptions = getFlexibilityOptions();
        const keyConcepts = document.getElementById('keyConcepts').value;
        const referToInstructor = document.getElementById('referToInstructor').value;
        const formattingPreferences = getFormattingPreferences();
        const citationApproach = document.getElementById('citationApproach').value;
        
        // Process syllabus information
        const syllabusInfo = processSyllabusInput();
        const syllabusUsageDescription = getSyllabusUsageDescription(syllabusInfo);
        
        // Begin constructing the prompt
        let prompt = `I need your help creating custom instructions for a specialized Blackbox AI agent that will serve as a tutoring assistant for my course. Please provide thorough, detailed instructions that I can directly input into Blackbox.ai when creating my agent.

The agent will be used in a ${discipline} course (${courseName}) at the ${courseLevel} level. Its primary function will be to ${primaryFunction}.

=== Course Learning Objectives ===
The agent should support the following learning outcomes:
${formatTextAsLines(learningOutcomes)}

=== Student Needs ===
The agent should address these specific student needs:
${formatTextAsLines(studentNeeds)}

=== Learning Guidelines ===
The agent should ALWAYS:
${formatTextAsLines(alwaysDo)}

The agent should NEVER:
${formatTextAsLines(neverDo)}

=== Example Interaction ===
Here's a sample student request: "${sampleRequest}"

The agent should respond in this manner: ${responseApproach}

=== Agent Persona and Style ===
The agent should adopt a ${tone} tone in its interactions.
${flexibilityOptions}

=== Knowledge Scope ===
The agent should be knowledgeable about:
${formatTextAsLines(keyConcepts)}

The agent should refer these topics to me (the instructor):
${formatTextAsLines(referToInstructor)}`;

        // Add syllabus section if syllabus content is provided
        if (syllabusInfo.text || syllabusInfo.fileUploaded) {
            prompt += `\n\n=== Course Syllabus Integration ===
${syllabusUsageDescription}`;

            if (syllabusInfo.text) {
                prompt += `\n\nHere is the syllabus content that should be incorporated (in full):\n"""
${syllabusInfo.text}
"""`;
            } else if (syllabusInfo.fileUploaded) {
                prompt += `\n\nNote: A syllabus file (${syllabusInfo.fileName}) has been provided and should be referenced by the agent.`;
            }
        }

        prompt += `\n\n=== Output Preferences ===
${formattingPreferences}
For citations, the agent should ${getCitationDescription(citationApproach)}.

Please create detailed, ready-to-use custom instructions for my Blackbox AI agent based on these parameters. The instructions should be comprehensive, specific to my discipline, and designed to create an effective AI tutor that scaffolds learning and promotes critical thinking rather than simply providing answers.`;

        return prompt;
    }
    
    // Helper functions to get form values
    function getDisciplineValue() {
        if (disciplineSelect.value === 'other') {
            return document.getElementById('otherDiscipline').value;
        }
        return disciplineSelect.options[disciplineSelect.selectedIndex].text;
    }
    
    function getCourseLevelValue() {
        if (courseLevelSelect.value === 'other') {
            return document.getElementById('otherLevel').value;
        }
        return courseLevelSelect.options[courseLevelSelect.selectedIndex].text;
    }
    
    function getPrimaryFunctionValue() {
        if (primaryFunctionSelect.value === 'other') {
            return document.getElementById('otherFunction').value;
        }
        
        let functionText = '';
        switch (primaryFunctionSelect.value) {
            case 'generalSupport':
                functionText = 'provide general support throughout the course, addressing a wide range of student questions';
                break;
            case 'assignmentGuidance':
                functionText = 'offer guidance on assignments without providing direct answers';
                break;
            case 'conceptExplanation':
                functionText = 'explain complex concepts using multiple approaches and examples';
                break;
            case 'practiceFeedback':
                functionText = 'provide feedback on practice exercises and help students identify improvement areas';
                break;
            default:
                functionText = primaryFunctionSelect.options[primaryFunctionSelect.selectedIndex].text;
        }
        
        return functionText;
    }
    
    function getToneValue() {
        if (toneSelect.value === 'custom') {
            return document.getElementById('customTone').value;
        }
        
        let toneText = '';
        switch (toneSelect.value) {
            case 'socratic':
                toneText = 'Socratic (guiding through thoughtful questioning rather than direct answers)';
                break;
            case 'coach':
                toneText = 'supportive coach (encouraging, positive, and motivational)';
                break;
            case 'expert':
                toneText = 'knowledgeable expert (authoritative but approachable)';
                break;
            case 'peer':
                toneText = 'collaborative peer (friendly, relatable, working alongside the student)';
                break;
            default:
                toneText = toneSelect.options[toneSelect.selectedIndex].text;
        }
        
        return toneText;
    }
    
    function getFlexibilityOptions() {
        const options = [];
        if (document.getElementById('adjustDetail').checked) {
            options.push('The agent should adjust the level of detail based on the complexity of the question.');
        }
        if (document.getElementById('simplerExplanations').checked) {
            options.push('The agent should provide simpler explanations when requested by the student.');
        }
        if (document.getElementById('includeExamples').checked) {
            options.push('The agent should include relevant examples in its explanations.');
        }
        if (document.getElementById('askClarifying').checked) {
            options.push('The agent should ask clarifying questions when the student\'s request is unclear or too broad.');
        }
        
        return options.join('\n');
    }
    
    function getFormattingPreferences() {
        const preferences = [];
        if (document.getElementById('useBullets').checked) {
            preferences.push('Use bullet points for steps or lists');
        }
        if (document.getElementById('useAnalogies').checked) {
            preferences.push('Provide analogies to explain complex concepts');
        }
        if (document.getElementById('useExamples').checked) {
            preferences.push('Include examples in explanations');
        }
        
        if (preferences.length === 0) {
            return 'No specific formatting preferences.';
        }
        
        return 'The agent should:\n' + preferences.map(p => '- ' + p).join('\n');
    }
    
    function getCitationDescription(citationValue) {
        switch (citationValue) {
            case 'alwaysCite':
                return 'always cite sources when providing information';
            case 'quoteOnly':
                return 'only cite sources when directly quoting material';
            case 'focusExplanation':
                return 'focus on clear explanations rather than formal citations';
            default:
                return citationValue;
        }
    }
    
    function formatTextAsLines(text) {
        if (!text.trim()) {
            return '(No information provided)';
        }
        
        // Split by new lines or keep as is if no new lines
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length <= 1) {
            return text;
        }
        
        // Format as bullet points
        return lines.map(line => '- ' + line).join('\n');
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === previewModal) {
            closeModal();
        }
    };
    
    // Add CSS for validation feedback
    const style = document.createElement('style');
    style.textContent = `
        .invalid {
            border: 2px solid #dc3545 !important;
            background-color: #fff8f8 !important;
        }
        .error-message {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
});
