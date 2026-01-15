
const projects = [
    { szervezet_neve: "Numeric Tax Org", adoszama: 12345678, tamogatas: 1000000 }, // Simulate numeric tax ID
    { szervezet_neve: "String Tax Org", adoszama: "87654321", tamogatas: 2000000 }
];

function processProjects(projects) {
    try {
        console.log("Processing projects with DEFENSIVE CODING...");
        projects.forEach(project => {
            // Simulate useProjectData filtering WITH FIX
            const searchFields = [
                project.szervezet_neve,
                project.adoszama
            ].map(f => String(f || '').toLowerCase()); // FIXED

            console.log(`Search fields for ${project.szervezet_neve}:`, searchFields);

            // Simulate Statisztikak.tsx logic WITH FIX
            const invalidTaxIds = ['nincs adat', 'n/a', ''];
            // FIXED: String() casting
            if (project.adoszama && !invalidTaxIds.includes(String(project.adoszama).toLowerCase().trim())) {
                console.log(`Valid ID found: ${project.adoszama}`);
            }
        });
        console.log("Processing complete. No errors!");
    } catch (e) {
        console.error("Error encountered:", e.message);
    }
}

console.log("--- TEST 1: Raw numbers in state (Simulating fixed app) ---");
processProjects(projects);
