const getTemplateMessageWhatsApp = require('../functions/getTemplateMessageWhatsApp');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

const {
  models: { Message },
} = require("../models/index");

async function SendMessageWhatsApp(pedidos) {

  const start = new Date();

  console.log(`Iniciando processo de envio de mensagem às ${start.getHours()}:${start.getMinutes()}`);

  const tempoDeEspera = process.env.INTERVAL_SEND_WHATSAPP * 60000;

  let pedidosNovos = 0;
  let pedidosAtualizados = 0;
  let pedidosAnalisados = 0;
  let mensagensEnviadas = 0;

  if (!pedidos) {
    throw new Error('Array de pedidos para enviar mensagens no WhatsApp está vazio!');
  }

  //Para cada pedido
  for (let i = 0; i < pedidos.length; i++) {

    if (mensagensEnviadas !== 0 && mensagensEnviadas % process.env.SEND_WHATSAPP_TIME === 0) {
      console.log(`${mensagensEnviadas} mensagens já enviadas...`)
      console.log(`Aguardando ${process.env.INTERVAL_SEND_WHATSAPP} minutos para continuar o envio...`)
      await new Promise(r => setTimeout(r, tempoDeEspera));
    }

    //Verificar data da última ocorrência de mensagem salva no banco
    const { api, csv } = pedidos[i];
    const historico = api.historico[api.historico.length - 1];
    const { ocorrencia, evento, local, situacao, arCorreios } = historico;
    const eventoTrim = evento.trim();

    const pedido = await Message.findOne({ hawb: api.hawbId });

    if (!pedido) {
      //Pedido não existe no banco de dados -> Enviando whatsapp e criando registro no banco
      await Message.create({ hawb: api.hawbId, evento: eventoTrim });

      if (eventoTrim !== 'Sinistro - Cliente Avisado') {
        const textoMensagem = getTemplateMessageWhatsApp(eventoTrim, { nome: csv.name, hawb: csv.hawb, dataString: ocorrencia, arCorreios, situacao, local });
        if (textoMensagem !== '') {
         // await sendMessageAPIWhatsApp(csv.phone, textoMensagem);
          console.log(`MENSAGEM: ${textoMensagem} PARA NUMERO: ${csv.phone}`);
          pedidosNovos++;
          mensagensEnviadas++;
        }
      }


    } else if (pedido) {
      if (pedido.evento === 'Sinistro - Cliente Avisado') {
        console.log('Sinistro, cliente avisado e armazenado no banco');
      } else if (pedido.evento === 'Devolvido pelos correios'){
        console.log('Pedido devolvido pelos correios');
      } else if (pedido.evento === 'Entregue Terceiro' || pedido.evento === 'Comprovante registrado' || pedido.evento === 'Entrega registrada' || pedido.evento === 'Entrega registrada via RT') {
        //Evento do pedido possui status de pedido entregue
        console.log(`Pedido ${pedido.hawb} já entregue`);
      } else if (pedido.evento === eventoTrim) {
        console.log(`Pedido ${pedido.hawb} não atualizado`);
      } else if (pedido.evento !== eventoTrim) {
        //Evento do pedido alterou
        const textoMensagem = getTemplateMessageWhatsApp(eventoTrim, { nome: csv.name, hawb: csv.hawb, dataString: ocorrencia, arCorreios, situacao, local });
        if (textoMensagem !== '') {
         // await sendMessageAPIWhatsApp(csv.phone, textoMensagem);
          console.log(`MENSAGEM: ${textoMensagem} PARA NUMERO: ${csv.phone}`);
          await Message.updateOne({ _id: pedido._id }, { evento: eventoTrim });
          pedidosAtualizados++;
          mensagensEnviadas++;
        }
      }
    }
  }

  const end = new Date();

  const log = `Mensagem técnica: 
  \nInicio do processo: *${start.getHours()}:${start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes()}*\n
  \nPedidos analisados: *${pedidos.length}*
  \nPedidos novos (mensagens enviadas): *${pedidosNovos}*
  \nPedidos atualizados (mensagens enviadas): *${pedidosAtualizados}*\n
  \nFim do processo: ${end.getHours()}:${end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes()}
  `

  await sendMessageAPIWhatsApp('31989551995', log);
  await sendMessageAPIWhatsApp('11989187726', log);
  console.log(`✔ Pedidos analisados: ${pedidos.length}`)
  console.log(`✔ Pedidos novos (mensagens enviadas): ${pedidosNovos}`)
  console.log(`✔ Pedidos atualizados (mensagens enviadas): ${pedidosAtualizados}`)
}


module.exports = SendMessageWhatsApp;