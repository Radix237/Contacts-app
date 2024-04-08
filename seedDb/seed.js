const Contact = require("../models/contact");

// Funkce pro naplnění kontaktů v databázi
async function populateContacts() {
    try {
        const contactsData = [
            {
                name: "Štěpán Netolický",
                phone: "123456789",
                email: "wolfys@seznam.cz",
                organization: "UHK",
                notes: "Spolužák"
            },
            {
                name: "Jiří Dostál",
                phone: "987654321",
                email: "dostalji@uhk.cz",
                organization: "UHK"
            },
            {
                name: "Matouš Svárovský",
                phone: "555555555",
                email: "svaroma@seznam.cz",
                organization: "UHK",
                notes: "Spolužák"
            },
            {
                name: "Jiří Žák",
                phone: "987333321",
                email: "zakjir@uhk.cz",
                organization: "UHK"
            },
            {
                name: 'David Netolický',
                phone: '735918133',
                email: 'memeli.netolicky@seznam.cz',
                organization: 'Karate Club Mémeli Kameničky'
            },
            {
                name: "Bára Muchová",
                phone: "785333236",
                email: "barcekmuchu@seznam.cz",
                organization: "Atletika Ostroměř",
                notes: "Docela frajer"
            },
            {
                name: "Ondřej Přetržitý",
                phone: "203038435",
                email: "ondrap@seznam.cz",
                organization: "Práce",
            },
            {
                name: "Iveta Blbomyslná",
                phone: "050203051",
                email: "ivousek@seznam.cz",
            },
        ];

        // Zamezení vložení duplicitního kontaktu při plnění db.
        for (let contactData of contactsData) {
            const existingContact = await Contact.findOne({ email: contactData.email });
            if (!existingContact) {
                await Contact.create(contactData);
            }
        }

        console.log("Seeding to the database successfully.");
    } catch (error) {
        console.error("Error while seeding to database:", error);
    }
}

module.exports = populateContacts;