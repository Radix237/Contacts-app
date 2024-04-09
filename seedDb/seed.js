const Contact = require("../models/contact");

// Funkce pro naplnění kontaktů do databáze
async function seedContacts() {
    try {
        const contactsData = [
            {
                name: "John Doe",
                phone: "+123456789000",
                email: "john.doe@example.com",
                organization: "ABC Company",
                notes: "Longtime colleague",
                createdBy: null
            },
            {
                name: "Jane Smith",
                phone: "+198765432100",
                email: "jane.smith@example.com",
                organization: "XYZ Corporation",
                notes: "Client",
                createdBy: null
            },
            {
                name: "Michael Johnson",
                phone: "+112233445566",
                email: "michael.johnson@example.com",
                organization: "123 Industries",
                notes: "Business partner",
                createdBy: null
            },
            {
                name: "Emily Davis",
                phone: "+144440011122",
                email: "emily.davis@example.com",
                organization: "Tech Innovations",
                notes: "Friend",
                createdBy: null
            },
            {
                name: "Chris Brown",
                phone: "+177799988887",
                email: "chris.brown@example.com",
                organization: "Startup Ventures",
                createdBy: null
            },
            {
                name: "Samantha Wilson",
                phone: "+155555555555",
                email: "samantha.wilson@example.com",
                organization: "Marketing Agency",
                notes: "Former colleague",
                createdBy: null
            }
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

module.exports = seedContacts;