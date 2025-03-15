document.getElementById('riskForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Input validation
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bp = document.getElementById('bloodPressure').value;

    // Meaningful error messages
    if (height < 60) {
        alert('Height must be at least 60 centimeters');
        return;
    }
    if (age < 0 || age > 120) {
        alert('Age must be between 0 and 120 years');
        return;
    }
    if (weight < 20) {
        alert('Weight must be at least 20 kg');
        return;
    }
    if (!bp.match(/^\d{2,3}\/\d{2,3}$/)) {
        alert('Blood pressure must be in format: systolic/diastolic (e.g., 120/80)');
        return;
    }

    const formData = {
        age,
        height,
        weight,
        bloodPressure: bp,
        diseases: Array.from(document.querySelectorAll('input[name="diseases"]:checked'))
            .map(checkbox => checkbox.value)
    };

    try {
        // All calculations are done on the server via API call
        const response = await fetch('http://localhost:3001/calculate-risk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        const resultDiv = document.getElementById('result');
        
        // Summary of all values and final results
        resultDiv.innerHTML = `
            <h3>Risk Assessment Summary</h3>
            <p>Input Values:</p>
            <ul>
                <li>Age: ${age} years</li>
                <li>Height: ${height} cm</li>
                <li>Weight: ${weight} kg</li>
                <li>BMI: ${data.details.bmi}</li>
                <li>Blood Pressure: ${bp}</li>
                <li>Family Diseases: ${formData.diseases.join(', ') || 'None'}</li>
            </ul>
            <p>Risk Points:</p>
            <ul>
                <li>Age Points: ${data.details.agePoints}</li>
                <li>BMI Points: ${data.details.bmiPoints}</li>
                <li>Blood Pressure Points: ${data.details.bpPoints}</li>
                <li>Family History Points: ${data.details.diseasePoints}</li>
            </ul>
            <p>Total Risk Points: ${data.details.totalPoints}</p>
            <h4>Final Risk Category: ${data.riskLevel}</h4>
        `;
        
        resultDiv.className = `result ${data.riskLevel.toLowerCase().replace(' ', '-')}`;
        resultDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = 'Error calculating risk. Please try again.';
        resultDiv.className = 'result error';
        resultDiv.classList.remove('hidden');
    }
});