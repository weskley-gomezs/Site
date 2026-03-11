import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuração do Transportador de E-mail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'weskleygomez@gmail.com',
      pass: process.env.EMAIL_PASS
    }
  });

  // Log de verificação de configuração (Aparece no terminal ao iniciar)
  console.log("--- Verificação de E-mail ---");
  console.log("Usuário:", process.env.EMAIL_USER || 'weskleygomez@gmail.com');
  console.log("Senha de App configurada:", process.env.EMAIL_PASS ? "SIM (✅)" : "NÃO (❌)");
  if (!process.env.EMAIL_PASS) {
    console.log("Aviso: Você precisa configurar a variável EMAIL_PASS no menu Settings.");
  }
  console.log("----------------------------");

  // Rota para receber os dados do formulário
  app.post("/api/contact", async (req, res) => {
    const lead = {
      id: Date.now(),
      data_envio: new Date().toLocaleString("pt-BR"),
      ...req.body
    };

    const filePath = path.join(__dirname, "leads.json");

    // Lendo arquivo existente ou criando um novo array
    let leads = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      try {
        leads = JSON.parse(fileData);
      } catch (e) {
        leads = [];
      }
    }

    // Adicionando o novo lead
    leads.push(lead);

    // Salvando de volta no arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(leads, null, 2));

    console.log("Novo Lead Recebido e Salvo em JSON:", lead);

    // Envio de E-mail
    if (process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"WK Company Leads" <${process.env.EMAIL_USER || 'weskleygomez@gmail.com'}>`,
          to: process.env.EMAIL_TO || 'weskleygomez@gmail.com',
          subject: `Novo Lead: ${lead.nome}`,
          text: `Você recebeu um novo lead!\n\nNome: ${lead.nome}\nE-mail: ${lead.email}\nWhatsApp: ${lead.whatsapp}\nNicho: ${lead.nicho}\nServiço: ${lead.servico}\nData: ${lead.data_envio}`,
          html: `
            <h2>Novo Lead Recebido!</h2>
            <p><strong>Nome:</strong> ${lead.nome}</p>
            <p><strong>E-mail:</strong> ${lead.email}</p>
            <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
            <p><strong>Nicho:</strong> ${lead.nicho}</p>
            <p><strong>Serviço:</strong> ${lead.servico}</p>
            <p><strong>Data:</strong> ${lead.data_envio}</p>
          `
        });
        console.log("E-mail enviado com sucesso!");
      } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
      }
    } else {
      console.log("Aviso: EMAIL_PASS não configurado. O lead foi salvo apenas no JSON.");
    }

    // Redirecionando para a página de obrigado
    res.redirect("/obrigado.html");
  });

  // Rota para você visualizar os leads salvos (Acesse: seu-site.com/api/leads)
  app.get("/api/leads", (req, res) => {
    const filePath = path.join(__dirname, "leads.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      res.header("Content-Type", "application/json");
      res.send(data);
    } else {
      res.json({ message: "Nenhum lead encontrado ainda." });
    }
  });

  // Configuração do Vite para o Frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse seus leads em: http://localhost:${PORT}/api/leads`);
  });
}

startServer();
