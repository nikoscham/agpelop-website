const bridgeData = {
    'gefyri-1': {
        name: 'Γεφύρι της Καρύταινας',
        location: 'Καρύταινα, Αρκαδία',
        river: 'Αλφειός',
        county: 'Αρκαδία',
        year: '1441',
        description: 'Αποτελείται από πέντε άνισα τόξα με ορθογώνια ανακουφιστικά ανοίγματα, τρία επάλληλα καταστρώματα, έχει ύψος 12 μέτρα, μήκος 50 και το μεγαλύτερο τόξο έχει άνοιγμα 8,75 μέτρα.',
        links: 'Σχετικό άρθρο στο blog: <a href="http://agpelop.blogspot.com/2013/09/normal-0-false-false-false-el-x-none-x_2.html" target="_blank">Το γεφύρι της Καρύταινας </a>',
    },
    'gefyri-2': {
        name: 'Γεφύρι της Μαυροζούμενας',
        location: 'Νεοχώρι, Μεσσηνία',
        river: '-',
        county: 'Μεσσηνία',
        year: '-',
        description: '-',
        links: '-',
    }
};

document.getElementById('bridge-select').addEventListener('change', function(e) {
    console.log('Selection changed:', e.target.value); // Add this line
    const detailsDiv = document.getElementById('bridge-details');
    if (!e.target.value) {
        detailsDiv.classList.add('hidden');
        return;
    }

    const bridge = bridgeData[e.target.value];
    detailsDiv.innerHTML = `
        <h4>${bridge.name}</h4>
        <p><strong><i class="fas fa-map-marker-alt"></i> Τοποθεσία:</strong> ${bridge.location}</p>
        <p><strong><i class="fas fa-water"></i> Ποτάμι:</strong> ${bridge.river}</p>
        <p><strong><i class="fas fa-calendar-alt"></i> Έτος Κατασκευής:</strong> ${bridge.year}</p>
        <p><strong><i class="fas fa-info-circle"></i> Περιγραφή:</strong> ${bridge.description}</p>
        <p><strong><i class="fas fa-link"></i> Σύνδεσμοι:</strong> ${bridge.links}</p>
    `;
    detailsDiv.classList.remove('hidden');
});

// Add this initialization code at the end of the file
document.addEventListener('DOMContentLoaded', function() {
    const detailsDiv = document.getElementById('bridge-details');
    detailsDiv.classList.add('hidden');
    document.getElementById('bridge-select').value = '';
});