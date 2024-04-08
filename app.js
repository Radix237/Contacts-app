//C:\Users\netol\Documents\TNPW2\mongodb\bin\mongod.exe --dbpath=C:\Users\netol\Documents\TNPW2\mongodb-data

const express = require("express");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const port = 3000;
const path = require("path");
const db = require("./config/mongoose");
const Contact = require("./models/contact");
const seedContacts = require("./seedDb/seed");
const app = express();

// Middleware pro session
app.use(
  session({
    secret: "radix",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware pro inicializaci Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.flash();
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("assets"));

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) return done(null, false, { message: "Incorrect email." });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
          return done(null, false, { message: "Incorrect password." });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/*
app.use(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log("aaaaaa")
    await populateContacts();
  }
  next();
});
*/

// Serializace a deserializace uživatele pro uložení do session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.get("/", async function (req, res) {
  try {
    let contacts = [];

    // Pokud je uživatel přihlášen, načti jen kontakty, které vytvořil aktuální uživatel
    if (req.isAuthenticated()) {
      contacts = await Contact.find({ createdBy: req.user._id });
    } else await seedContacts()

    // Vyrenderování úvodní stránky s kontakty
    return res.render("index", {
      title: "Contacts List",
      isLogged: req.isAuthenticated(),
      contact_list: contacts,
    });
  } catch (error) {
    console.log("Error in fetching contacts from database:", error);
    return res.status(500).send("Error occurred while fetching contacts.");
  }
});


app.get("/login", async (req, res, next) => {
  // přesměruj nepřihlášeného uživatele na domovskou stránku
  if (!req.user) return res.redirect("/");

  // Zde by se měly zobrazit pouze kontakty aktuálně přihlášeného uživatele
  const contacts = await Contact.find({ createdBy: req.user._id });
  return res.render("index", {
    title: "Contacts List",
    isLogged: true,
    contact_list: contacts,
  });
});


// přihlas uživatele lokální strategií a přesměruj na authentizovanou zonu, jinak přesměruj zpět na domovskou
app.post("/login",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/login",
    failureRedirect: "/",
    failureMessage: true,
  })
);

// Cesta pro registraci
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    console.log("\x1b[32mSuccessfully registered as\x1b[0m", email);
    res.redirect("/")

  } catch (error) {
    console.error("Error registering user:", error);
    res.redirect("/");
  }
});

// Logout cesta
app.get("/logout", function (req, res) {
  req.logout(() => {
    res.redirect("/");
    console.log("\x1b[31mSuccessfully logged out\x1b[0m");
  });
});


const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

app.post("/create-contact", isLoggedIn, function (req, res) {
  const currentUser = req.user; // Získání aktuálně přihlášeného uživatele

  Contact.create(
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      organization: req.body.organization,
      notes: req.body.notes,
      createdBy: currentUser._id // Přiřazení ID aktuálně přihlášeného uživatele k nově vytvořenému kontaktu
    },
    function (err, newContact) {
      if (err) {
        console.log("Not able to add contact:", err);
        return;
      }
      console.log("Contact added:", newContact);
      return res.redirect("/login");
    }
  );
});


app.post("/edit-contact/:id", isLoggedIn, function (req, res) {
  const id = req.params.id;
  Contact.findByIdAndUpdate(
    id,
    {
      email: req.body.email,
      organization: req.body.organization,
      notes: req.body.notes,
    },
    function (err) {
      if (err) {
        console.log("Error updating contact:", err);
        return res.redirect("/");
      }
      return res.redirect("/login");
    }
  );
});

app.get("/delete-contact", isLoggedIn, function (req, res) {
  let id = req.query.id;
  Contact.findByIdAndDelete(id, function (err) {
    if (err) {
      console.log("Unable to delete this contact", err);
      return;
    }
    return res.redirect("/login");
  });
});

app.listen(port, function (err) {
  if (err) {
    console.log("Can't connect to this port", err);
  }
  console.log("Server is running on port", port);
});
