# 🏥 MediConnect - Healthcare Appointment Platform

## 📋 Description

MediConnect is a web-based healthcare appointment platform that allows patients to book appointments with doctors, manage their medical profiles, and access healthcare services online.

## ⚠️ Educational Purpose

**This application is intentionally vulnerable and designed for cybersecurity education and penetration testing practice.**

**DO NOT deploy this application in a production environment!**

## 🎯 Learning Objectives

This application is designed to help you learn about:
- **Remote Code Execution (RCE)** via double extension bypass
- File upload vulnerabilities and bypasses
- Path validation weaknesses (`path.extname()`)
- Node.js security misconfigurations
- Post-exploitation techniques (filesystem access)
- CTF-style flag discovery (`/flag.txt`)

## 🚀 Getting Started

### Prerequisites

- Docker Desktop installed and running
- Git (optional, for cloning)

### Installation

1. Clone the repository (if not already done):
```bash
git clone https://github.com/Elouaaaan/vulnerable_app.git
cd vulnerable_app
```

2. Start the application:
```bash
docker-compose up -d --build
```

3. Access the application:
```
http://localhost:8080
```

### Default Setup

- **Application Port**: 8080
- **Database**: PostgreSQL 15 (port 5432)
- **Framework**: Express.js + Node.js 24
- **Template Engine**: EJS
- **Authentication**: JWT + bcrypt

## 🎯 Vulnerability: RCE via Double Extension

### **Challenge:**
Exploit a file upload vulnerability to gain Remote Code Execution and retrieve the flag.

### **Quick Start (3 minutes):**
1. Create an account on http://localhost:8080
2. Navigate to "Mon Profil" (My Profile)
3. Upload `test.js.png` (just 2 lines, 138 bytes!)
4. Access the uploaded file at `/uploads/profile-X-XXXXX-test.js.png`
5. **🎯 FLAG DISPLAYS IN YOUR BROWSER!** (Styled HTML page)

### **Documentation:**
- 📖 **`VULNERABILITY_RCE.md`** - Complete exploitation guide, theory, and defenses

## 📚 Technologies Used

- **Backend**: Node.js 24, Express.js 4.21.2
- **Database**: PostgreSQL 15
- **Template Engine**: EJS 3.1.10
- **CSS Framework**: Tailwind CSS 3.4.18
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Containerization**: Docker, Docker Compose

## 🗂️ Project Structure

```
vulnerable_app/
├── app/
│   ├── routes/          # Application routes
│   ├── views/           # EJS templates
│   ├── public/          # Static files (CSS, JS)
│   ├── middlewares/     # Custom middleware
│   └── app.js           # Main application file
├── db/
│   └── init/            # Database initialization scripts
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## 🛠️ Useful Commands

### View logs (for exploitation)
```bash
docker logs vulnerable_app-app-1 -f        # Watch for exploit output
docker logs vulnerable_app-postgresdb-1 -f # Database logs
```

### Verify flag exists
```bash
docker exec vulnerable_app-app-1 cat /flag.txt
```

### Restart services
```bash
docker-compose restart app
docker-compose restart postgresdb
```

### Stop and remove containers
```bash
docker-compose down
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up -d --build
```

### Access database
```bash
docker-compose exec postgresdb psql -U postgres -d vulnerable_app_db
```

## 🎓 Learning Resources

### **Exploitation Guides:**
- 📖 **`GUIDE_EXPLOITATION_FLAG.md`** ⭐ START HERE - Quick 5-minute guide
- 📖 **`EXPLOITATION_RAPIDE.md`** - Fast exploitation with diagrams
- 📖 **`EXPLOITATION_REALISTE.md`** - Complete technical analysis
- 📖 **`MODIFICATIONS_REALISTE.md`** - Why `/flag.txt` is more realistic

### **Payload Files:**
- `test_payloads/exploit.js.png` - Main RCE payload
- `test_payloads/shell.php.jpg` - Alternative (if PHP was installed)
- `test_payloads/DEMO_DOUBLE_EXTENSION.html` - Interactive demo

## ⚖️ Legal & Ethical Notice

This application is provided for **educational purposes only**.

- Only test on your own local installation
- Do not use these techniques on applications you don't own or have permission to test
- Unauthorized access to computer systems is illegal
- Use this knowledge responsibly and ethically

## 🤝 Contributing

This is an educational project. If you find additional vulnerabilities or improvements:
1. Document the vulnerability
2. Suggest a fix
3. Submit a pull request

## 📄 License

This project is for educational purposes. Use at your own risk.

---

**Happy Hacking! 🔓**

*Remember: With great power comes great responsibility.*
