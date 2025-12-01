import React, { useState, useEffect } from 'react';

// No futuro, você pode querer mover esses dados para um arquivo .json
// ou buscá-los de uma API.
import faturaData from './fatura.json' with { type: 'json' };

export function FaturaPage() {
  const [faturas, setFaturas] = useState([]);

  useEffect(() => {
    // Simulando uma busca de dados.
    // Aqui você filtraria as faturas para o usuário logado.
    setFaturas(faturaData);
  }, []);

  return (
    <div>
      <h2>Fatura do Cartão</h2>
      <ul>
        {faturas.map((item) => (
          <li key={item.id}>
            {item.data}: {item.descricao} - R$ {item.valor.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
