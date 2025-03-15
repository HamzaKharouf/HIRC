const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Standard configuration for local testing
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.static('.'));

// All risk calculations implemented in Node.js
function calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

function calculateAgePoints(age) {
    if (age < 30) return 0;
    if (age < 45) return 10;
    if (age < 60) return 20;
    return 30;
}

function calculateBMIPoints(bmi) {
    if (bmi < 25) return 0;         // normal
    if (bmi < 30) return 30;        // overweight
    return 75;                      // obese
}

function calculateBPPoints(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 0;        // normal
    if (systolic < 130 && diastolic < 80) return 15;       // elevated
    if (systolic < 140 || diastolic < 90) return 30;       // stage 1
    if (systolic < 180 || diastolic < 120) return 75;      // stage 2
    return 100;                                            // Crisis
}

function calculateDiseasePoints(diseases) {
    return diseases.length * 10;
}

function getRiskCategory(totalPoints) {
    if (totalPoints <= 20) return 'Low Risk';
    if (totalPoints <= 50) return 'Moderate Risk';
    if (totalPoints <= 75) return 'High Risk';
    return 'Uninsurable';
}

// API endpoint that implements ALL calculations
app.post('/calculate-risk', (req, res) => {
    const { age, height, weight, bloodPressure, diseases } = req.body;

    // Calculate BMI
    const bmi = calculateBMI(height, weight);

    // Parse blood pressure
    const [systolic, diastolic] = bloodPressure.split('/').map(Number);

    // Calculate all risk points
    const agePoints = calculateAgePoints(age);
    const bmiPoints = calculateBMIPoints(bmi);
    const bpPoints = calculateBPPoints(systolic, diastolic);
    const diseasePoints = calculateDiseasePoints(diseases);

    // Calculate total risk
    const totalPoints = agePoints + bmiPoints + bpPoints + diseasePoints;
    const riskLevel = getRiskCategory(totalPoints);

    // Send complete results
    res.json({
        riskLevel,
        details: {
            bmi: bmi.toFixed(1),
            agePoints,
            bmiPoints,
            bpPoints,
            diseasePoints,
            totalPoints
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});