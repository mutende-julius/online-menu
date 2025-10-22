document.getElementById('clientSetupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const clientData = {
        businessName: document.getElementById('businessName').value,
        shortcode: document.getElementById('shortcode').value,
        passkey: document.getElementById('passkey').value,
        primaryColor: document.getElementById('primaryColor').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
        clientId: generateClientId(document.getElementById('businessName').value)
    };

    // Save to backend
    fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('setupResult').style.display = 'block';
        document.getElementById('setupResult').innerHTML = `
            <h3>✅ Client Setup Complete!</h3>
            <p><strong>Client ID:</strong> ${data.clientId}</p>
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Configure menu items for ${clientData.businessName}</li>
                <li>Test M-Pesa integration</li>
                <li>Train client staff</li>
                <li>Go live!</li>
            </ol>
            <button onclick="location.href='admin-dashboard.html'" class="checkout-btn">📊 Go to Dashboard</button>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Setup failed. Please check console for details.');
    });
});

function generateClientId(businessName) {
    return businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-6);
}