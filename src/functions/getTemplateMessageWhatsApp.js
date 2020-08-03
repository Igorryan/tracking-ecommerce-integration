function getTemplateMessageWhatsApp(evento, client) {

  const { nome, dataString, arCorreios, hawb, situacao, local } = client;
  const newHawb = hawb.substr(1);
  const [data, horaComMilessegundos] = dataString.split(' ');
  const [hora,] = horaComMilessegundos.split('.')
  const [hour, minutes, seconds] = hora.split(':')

  if (evento === 'Redespachado por Terceiro') {
    return `Olá, ${nome} 
    \nSeu pedido Amend foi postado em ${data} às ${hour}:${minutes} sob o código de rastreio *${newHawb}*.
    \nPara receber as próximas atualizações da sua entrega, salve nosso contato na sua agenda e responda com a frase *ACOMPANHAR ENTREGA*
    \nVocê também pode acompanhar o status da sua encomenda no site da Flash Logística através do link abaixo 👇
    
    >>> https://flashcourier.com.br/rastreio/${newHawb}    
    
    \n_Essa é uma mensagem automática_`
  }
  else if ((evento === 'Entregue Terceiro' || evento === 'Comprovante registrado' || evento === 'Entrega registrada' || evento === 'Entrega registrada via RT')) {
    return `Oi, ${nome}.
    \nVimos que o seu pedido foi entregue. Esperamos muito que goste dos produtos.
    \nContinuamos à disposição caso tenha alguma dúvida e agradecemos pela preferência em comprar conosco.
    \n_Esta é uma mensagem automática_`
  }
  else if ((evento === 'Entrega não efetuada')) {
    return `${nome},
    \nFoi tentada a entrega do seu pedido Amend em ${data} às ${hour}:${minutes}, porém, sem sucesso.
    \nMotivo: ${situacao}
    \nPor favor, entre em contato com o SAC Amend no link abaixo para te ajudarmos.
    
    >>> https://bit.ly/3cFGW4o
   
    \n_Esta é uma mensagem automática_`
  }
  else if ((evento === 'Preparada para a transferencia')) {
    return `${nome},
    \nSeu pedido Amend sob código de rastreio *${newHawb}* está sendo transferido para ${local}. Te manteremos informado(a) sobre o status da sua entrega.
    \nVocê também pode acompanhar o status da sua encomenda através do link abaixo 👇
    
    >>> https://flashcourier.com.br/rastreio/${newHawb}
    
    \n_Esta é uma mensagem automática_`
  }

  return '';
}


module.exports = getTemplateMessageWhatsApp;