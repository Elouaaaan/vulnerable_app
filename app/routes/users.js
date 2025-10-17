var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');
var multer = require('multer');
var path = require('path');
var fs = require('fs');

// Configuration de multer pour l'upload de fichiers (VULNÉRABLE - Double Extension)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // VULNERABILITY: Double extension attack
    // Le nom original peut contenir plusieurs points (e.g., shell.php.jpg)
    // On conserve le nom complet sans nettoyage
    const originalName = file.originalname;
    const timestamp = Date.now();
    
    // Parsing naïf: on garde tout le nom avec toutes ses extensions
    cb(null, `profile-${req.user.id}-${timestamp}-${originalName}`);
  }
});

// FileFilter qui vérifie seulement la DERNIÈRE extension (VULNÉRABLE)
const fileFilter = (req, file, cb) => {
  // Récupère seulement la dernière extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Whitelist basique qui vérifie uniquement l'extension finale
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  if (allowedExtensions.includes(ext)) {
    // Extension finale OK -> fichier accepté
    // Mais ne vérifie PAS s'il y a d'autres extensions avant (e.g., .php.jpg)
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Route profile (protégée)
router.get('/profile', authMiddleware, function(req, res, next) {
  // Données statiques pour le moment
  const userData = {
    id: req.user.id,
    email: req.user.email,
    fullName: `${req.user.name} ${req.user.surname}`,
    phone: '+33 6 12 34 56 78',
    dateOfBirth: '1990-01-01',
    address: '123 Rue de la Santé',
    city: 'Paris',
    postalCode: '75001',
    bloodType: 'O+',
    allergies: 'None',
    emergencyContact: '+33 6 98 76 54 32',
    profilePicture: req.query.uploaded ? `/uploads/${req.query.uploaded}` : null
  };
  
  res.render('profile', { 
    title: 'My Profile - MediConnect',
    user: userData,
    uploadSuccess: req.query.uploaded ? true : false
  });
});

// Route d'upload de photo de profil (VULNÉRABLE - Double Extension)
router.post('/profile/upload', authMiddleware, upload.single('profilePicture'), function(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded' 
    });
  }

  // VULNERABILITY: Double Extension Attack
  // Le fileFilter vérifie uniquement la dernière extension (.jpg)
  // Mais le nom peut contenir shell.php.jpg
  // Si le serveur traite les extensions de gauche à droite, .php sera exécuté
  
  const fileUrl = `/uploads/${req.file.filename}`;
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  
  console.log(`File uploaded: ${req.file.filename}`);
  console.log(`Original name: ${originalName}`);
  console.log(`File path: ${filePath}`);
  console.log(`File mimetype: ${req.file.mimetype}`);
  
  // Vérifier si le fichier contient plusieurs extensions (détection simple, mais pas de blocage)
  const dotCount = (originalName.match(/\./g) || []).length;
  if (dotCount > 1) {
    console.warn(`⚠️ WARNING: File has multiple extensions: ${originalName}`);
    // On log un warning mais on N'EMPÊCHE PAS l'upload (VULNÉRABILITÉ)
  }
  
  // Redirection vers la page de profil avec le fichier uploadé
  res.redirect(`/users/profile?uploaded=${req.file.filename}`);
});

module.exports = router;


