var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// VULNERABILITY: Handler malveillant pour fichiers avec double extension
// IMPORTANT: Doit être AVANT express.static pour intercepter les fichiers malveillants
// Si un fichier .js.png ou .php.jpg est demandé, on essaie de l'exécuter
app.use('/uploads', (req, res, next) => {
  const requestedFile = req.path;
  
  // Vérifier si le fichier a une double extension dangereuse
  const dangerousPatterns = [
    /\.js\.(jpg|jpeg|png|gif)$/i,     // .js.jpg, .js.png, etc.
    /\.php\.(jpg|jpeg|png|gif)$/i,    // .php.jpg (si PHP était installé)
    /\.sh\.(jpg|jpeg|png|gif)$/i,     // .sh.jpg (shell scripts)
  ];
  
  const isDangerous = dangerousPatterns.some(pattern => pattern.test(requestedFile));
  
  if (isDangerous && requestedFile.includes('.js.')) {
    // VULNÉRABILITÉ: Si c'est un .js.png/.js.jpg, on l'exécute comme du JavaScript
    const filePath = path.join(__dirname, 'public', 'uploads', path.basename(requestedFile));
    
    console.warn(`⚠️ DANGEROUS: Attempting to execute file with double extension: ${requestedFile}`);
    
    try {
      // Essayer de charger et exécuter le fichier comme un module Node.js
      delete require.cache[require.resolve(filePath)]; // Clear cache
      const exploitModule = require(filePath);
      
      // Si le module retourne un flag, on l'affiche de manière visible
      if (exploitModule && exploitModule.flag) {
        res.type('text/html');
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>🔥 Exploitation Réussie!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        h1 {
            color: #e74c3c;
            font-size: 36px;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .flag-box {
            background: #2c3e50;
            color: #2ecc71;
            padding: 30px;
            border-radius: 10px;
            margin: 30px 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            word-break: break-all;
            box-shadow: inset 0 4px 6px rgba(0,0,0,0.3);
            border: 3px solid #2ecc71;
        }
        .details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: left;
        }
        .details h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .details p {
            color: #555;
            line-height: 1.8;
            margin-bottom: 10px;
        }
        .vulnerability {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
        }
        .vulnerability strong {
            color: #856404;
        }
        code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            color: #e74c3c;
            font-weight: bold;
        }
        .success {
            color: #27ae60;
            font-size: 18px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔥💀🎯</div>
        <h1>🎉 EXPLOITATION RÉUSSIE! 🎉</h1>
        
        <div class="flag-box">
            ${exploitModule.flag}
        </div>
    </div>
</body>
</html>
        `);
        return;
      }
      
      // Sinon, message générique
      res.type('text/html');
      res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Module Executed</title>
    <style>
        body { font-family: monospace; padding: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; max-width: 800px; margin: 0 auto; }
        h1 { color: #e74c3c; }
        pre { background: #2c3e50; color: #2ecc71; padding: 20px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚠️ Module Executed</h1>
        <p>The file was executed as JavaScript code.</p>
        <pre>${JSON.stringify(exploitModule, null, 2)}</pre>
    </div>
</body>
</html>
      `);
      return;
    } catch (error) {
      console.error('Error executing double extension file:', error.message);
      // Si l'exécution échoue, on continue vers le handler statique normal
    }
  }
  
  // Sinon, continuer normalement
  next();
});

// Servir les fichiers statiques APRÈS le middleware malveillant
// pour que les fichiers .js.png soient interceptés et exécutés avant d'être servis
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
