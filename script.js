const bridgeData = {
    'gefyri-1': {
        name: 'Γεφύρι της Καρύταινας',
        location: 'Καρύταινα, Αρκαδία',
        nomos: 'Αρκαδία',
        year: '1840',
        description: 'Πέτρινο γεφύρι πέντε τόξων στον ποταμό Αλφειό',
    },
    'gefyri-2': {
        name: 'Γεφύρι του Κούκου',
        location: 'Αρτεμισία, Μεσσηνία',
        nomos: 'Μεσσηνία',
        year: '1880',
        description: 'Μονότοξο πέτρινο γεφύρι',
    },
    'gefyri-3': {
        name: 'Γεφύρι της Αρτοζήνας',
        location: 'Αρτοζήνα, Ηλεία',
        nomos: 'Ηλεία',
        year: '1850',
        description: 'Τρίτοξο πέτρινο γεφύρι',
    },
    'gefyri-4': {
        name: 'Γεφύρι του Ατσιχόλου',
        location: 'Δημητσάνα, Αρκαδία',
        nomos: 'Αρκαδία',
        year: '1860',
        description: 'Μονότοξο πέτρινο γεφύρι',
    },
    'gefyri-5': {
        name: 'Γεφύρι της Μαυροζούμαινας',
        location: 'Μελιγαλάς, Μεσσηνία',
        nomos: 'Μεσσηνία',
        year: '1870',
        description: 'Δίτοξο πέτρινο γεφύρι',
    },
    'gefyri-6': {
        name: 'Γεφύρι του Αλφειού',
        location: 'Ολυμπία, Ηλεία',
        nomos: 'Ηλεία',
        year: '1855',
        description: 'Τρίτοξο πέτρινο γεφύρι',
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
        <p><strong>Τοποθεσία:</strong> ${bridge.location}</p>
        <p><strong>Έτος Κατασκευής:</strong> ${bridge.year}</p>
        <p><strong>Περιγραφή:</strong> ${bridge.description}</p>
    `;
    detailsDiv.classList.remove('hidden');
});