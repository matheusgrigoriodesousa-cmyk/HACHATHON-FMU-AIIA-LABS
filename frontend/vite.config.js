import { defineConfig } from "vite"; // Importa a função 'defineConfig' do Vite para ajudar com a autocompletação e validação da configuração.
import react from "@vitejs/plugin-react"; // Importa o plugin oficial do React para o Vite, que habilita funcionalidades como Fast Refresh.

export default defineConfig({ // Exporta a configuração do projeto.
  plugins: [react()], // Array de plugins a serem usados. Aqui, estamos ativando o plugin do React.
  server: { // Objeto de configuração para o servidor de desenvolvimento.
    port: 5173,   // Define a porta em que o servidor de desenvolvimento irá rodar. A padrão é 5173.
  } // Fecha o objeto de configuração do servidor.
}); // Fecha o objeto de configuração principal.
