
const projects = [
    { szervezet_neve: "Pro Ruris Egyesület - RO697565", adoszama: "nincs adat", tamogatas: 2000000 },
    { szervezet_neve: "Other Organization", adoszama: "nincs adat", tamogatas: 5000000 },
    { szervezet_neve: "Valid Org", adoszama: "12345678", tamogatas: 1000000 }
];

function calculateTopWinners(projects) {
    const winnersMap = new Map();

    projects.forEach(project => {
        // CURRENT LOGIC from Statisztikak.tsx
        // Use adoszama for unique ID if available, otherwise name
        const id = project.adoszama || project.szervezet_neve;
        if (!id) return;

        const key = String(id);

        if (!winnersMap.has(key)) {
            winnersMap.set(key, {
                name: project.szervezet_neve || 'Névtelen szervezet',
                count: 0,
                value: 0
            });
        }

        const winner = winnersMap.get(key);
        winner.count += 1;
        winner.value += (Number(project.tamogatas) || 0);
    });

    return Array.from(winnersMap.values());
}

console.log("Results with current logic:");
console.log(JSON.stringify(calculateTopWinners(projects), null, 2));

function calculateTopWinnersFixed(projects) {
    const winnersMap = new Map();

    projects.forEach(project => {
        // PROPOSED FIX
        const invalidTaxIds = ['nincs adat', 'n/a', ''];

        let id = project.szervezet_neve; // Default to name

        // If tax ID is valid, use it
        if (project.adoszama && !invalidTaxIds.includes(project.adoszama.toLowerCase())) {
            id = project.adoszama;
        }

        const key = String(id);

        if (!winnersMap.has(key)) {
            winnersMap.set(key, {
                name: project.szervezet_neve || 'Névtelen szervezet',
                count: 0,
                value: 0
            });
        }

        const winner = winnersMap.get(key);
        winner.count += 1;
        winner.value += (Number(project.tamogatas) || 0);
    });

    return Array.from(winnersMap.values());
}

console.log("\nResults with FIXED logic:");
console.log(JSON.stringify(calculateTopWinnersFixed(projects), null, 2));
