const getTemplateMessageWhatsApp = require('../functions/getTemplateMessageWhatsApp');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

const {
  models: { Message },
} = require("../models/index");

async function SendMessageWhatsApp(pedidos) {

  try {
    console.log('entrando no arquivo SendMessage')

    const start = new Date();

    const day = start.getDate() < 10 ? `0${start.getDate()}` : `${start.getDate()}`
    const month = start.getMonth() + 1 < 10 ? `0${start.getMonth() + 1}` : `${start.getMonth() + 1}`;

    let logs = `Log do dia: ${day}/${month}`;

    console.log(`Iniciando processo de envio de mensagem às ${start.getHours()}:${start.getMinutes()}`);

    const tempoDeEspera = process.env.INTERVAL_SEND_WHATSAPP * 60000;

    let pedidosNovos = 0;
    let pedidosAtualizados = 0;
    let pedidosAnalisados = 0;
    let mensagensEnviadas = 0;

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
            await sendMessageAPIWhatsApp(csv.phone, textoMensagem);
            console.log(`MENSAGEM: ${textoMensagem} PARA NUMERO: ${csv.phone}`);
            pedidosNovos++;
            mensagensEnviadas++;

            logs = `${logs}\nTipo de tracking: Novo. \nEvento: ${eventoTrim}\nMensagem para: ${csv.phone}\nHawb: ${csv.hawb}\n----------------------------------
              `
            await new Promise(resolve => setTimeout(resolve, 300));

          }
        }


      } else if (pedido) {
        if (pedido.evento === 'Sinistro - Cliente Avisado') {
          logs = `${logs}\nMensagem não enviada para: ${csv.phone}\nMotivo: Sinistro - Cliente Avisado\n----------------------------------
            `
          console.log('Sinistro, cliente avisado e armazenado no banco');
        } else if (pedido.evento === 'Devolvido pelos correios') {
          logs = `${logs}\nMensagem não enviada para: ${csv.phone}\nMotivo: Pedido devolvido pelos correios\n----------------------------------
            `
          console.log('Pedido devolvido pelos correios');
        } else if (pedido.evento === 'Entregue Terceiro' || pedido.evento === 'Comprovante registrado' || pedido.evento === 'Entrega registrada' || pedido.evento === 'Entrega registrada via RT') {
          //Evento do pedido possui status de pedido entregue
          logs = `${logs}\nMensagem não enviada para: ${csv.phone}\nMotivo: ${pedido.evento}\n----------------------------------
            `
          console.log(`Pedido ${pedido.hawb} já entregue`);
        } else if (pedido.evento === eventoTrim) {
          logs = `${logs}\nMensagem não enviada para: ${csv.phone}\nMotivo: pedido ${pedido.hawb} não atualizado\n----------------------------------
            `
          console.log(`Pedido ${pedido.hawb} não atualizado`);
        } else if (pedido.evento !== eventoTrim) {
          //Evento do pedido alterou
          const textoMensagem = getTemplateMessageWhatsApp(eventoTrim, { nome: csv.name, hawb: csv.hawb, dataString: ocorrencia, arCorreios, situacao, local });
          if (textoMensagem !== '') {

            console.log(`MENSAGEM: ${textoMensagem} PARA NUMERO: ${csv.phone}`);
            await Message.updateOne({ _id: pedido._id }, { evento: eventoTrim });
            await sendMessageAPIWhatsApp(csv.phone, textoMensagem);
            pedidosAtualizados++;
            mensagensEnviadas++;
            logs = `${logs}\nTipo de tracking: Atualização. \nEvento antigo: ${pedido.evento} \nEvento novo: ${eventoTrim}\nMensagem para: ${csv.phone}\nHawb: ${csv.hawb}\n----------------------------------
              `
            await new Promise(resolve => setTimeout(resolve, 300));

          }
        }
      }
    }

    const end = new Date();

    if (process.env.NUM_FOR_LOGS) {
      await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, `${logs}\nMensagem técnica: 
        \nInicio do processo: ${start.getHours() - 3}:${start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes()}\n
        \nPedidos analisados: ${pedidos.length}
        \nPedidos novos (mensagens enviadas): ${pedidosNovos}
        \nPedidos atualizados (mensagens enviadas): ${pedidosAtualizados}\n
        \nFim do processo: ${end.getHours() - 3}:${end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes()}
        `);
    }

    console.log(`✔ Pedidos analisados: ${pedidos.length}`)
    console.log(`✔ Pedidos novos (mensagens enviadas): ${pedidosNovos}`)
    console.log(`✔ Pedidos atualizados (mensagens enviadas): ${pedidosAtualizados}`)
    return true;
  } catch (err) {
    const erro = 'Erro na seção de envio de mensagens para o WhatsApp';
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    console.log(erro)
    return false;
  }
  return true;
}

module.exports = SendMessageWhatsApp;