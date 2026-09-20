// Italian: the Placement Hub case study. Each key is the English piece it replaces (see sections.js, PlacementBody.js and
// PlacementStory.js); a key left out simply shows the English. Written to read as Italian, not as a translation:
// "placement" is kept as the loanword Italian universities and companies use, people are "studenti" and "diplomati",
// tool and product names stay as they are, quotes use «», and figures use the decimal comma (the counters format themselves).
import Num from '@/components/case-study-kit/Num';
import { bad, good } from './helpers';

export default {
  // ---------------------------------------------------------------- page
  'meta.title': 'Rendere visibile il placement — Manik Madaan',
  'hero.back': 'Torna a tutti i lavori',
  'hero.eyebrow': 'Caso di studio · Product design leadership',
  'hero.headline': 'Rendere visibile agli studenti il processo di placement della più grande piattaforma di formazione AEC dell’India',
  'hero.lede':
    'Gli studenti avevano acquistato il supporto al placement, ma lo vivevano come una scatola nera. Ho guidato la direzione di design di un portale per gli studenti e di un sistema di placement riutilizzabile che rende visibili avanzamento, idoneità, opportunità e prossimi passi.',
  'hero.moreLabel': 'Ambito, team e tempi',
  'hero.lead': [
    { label: 'Ruolo', value: 'Product Design Manager / Design Lead' },
    { label: 'Azienda', value: 'Novatr, un’azienda di formazione per il settore AEC' },
    { label: 'Prodotto', value: 'Portale di placement' },
  ],
  'hero.more': [
    {
      label: 'Ambito',
      value:
        'Portale per gli studenti, adattamenti dei flussi Retool per le operations e basi riutilizzabili di stati e dati per i futuri prodotti interni e per le aziende partner',
    },
    {
      label: 'Team',
      value:
        'Manik Madaan, Product Design Manager · Sanya, Product Designer · Swati, Product Manager · operations di placement e ingegneria',
    },
    { label: 'Tempi', value: 'Circa tre mesi fino al lancio' },
  ],
  'hero.story': 'Leggi la versione in 2 minuti',
  'hero.coverAlt':
    'La home di Placement Hub con il pannello degli aggiornamenti aperto, che elenca gli aggiornamenti sulle candidature e le nuove opportunità, sopra i banner di idoneità e del modulo di interesse.',
  'proto.versions': [
    {
      eyebrow: 'Prototipo interattivo · Placement Hub',
      description:
        'Un prototipo funzionante dell’esperienza di placement: home, bacheca delle offerte, descrizioni delle posizioni, candidature e modulo di interesse. Ogni stato di candidatura è attivo: con il pulsante a forma di becher in basso a destra nel riquadro puoi vestire i panni del team di placement e far avanzare una candidatura nelle sue fasi.',
    },
  ],
  'proto.title': 'Prototipo interattivo di Placement Hub',
  'proto.heading': 'Placement Hub, dal vivo',
  'proto.note':
    'Tutti i dati di esempio sono sintetici. Scorri e clicca nel riquadro: è il prototipo completo, solo incorniciato. Prova il modulo di interesse dal banner della home, candidati a una posizione oppure apri il pulsante a forma di becher per far avanzare una candidatura nelle sue fasi.',
  'proto.mobileAlt':
    'La home di Placement Hub con il banner di idoneità, il banner del modulo di interesse e le candidature in corso dello studente',
  'nav.sections': [
    { label: 'Il problema' },
    { label: 'Evidenze' },
    { label: 'Nuova impostazione' },
    { label: 'Leadership' },
    { label: 'Il prodotto' },
    { label: 'Passaggio di consegne' },
    { label: 'Lancio e misurazione' },
  ],
  'footer.all': 'Tutti i lavori',
  'footer.contact': 'Contattami',

  // ---------------------------------------------------------------- 01 The problem
  'problem.eyebrow': 'Il problema',
  'problem.category': 'Discovery · interviste agli stakeholder · mappatura dei processi',
  'problem.questions': ['Che cosa non funzionava davvero, e per chi?'],
  'problem.artifacts': 'Journey map dello stato attuale · definizioni del problema · inventario dei punti dolenti degli studenti',
  'problem.heading': 'Il supporto al placement era invisibile',
  'problem.p1': (
    <>
      Chi concludeva un corso Novatr aveva già acquistato il supporto al placement: faceva parte della promessa del corso. Quello che trovava
      era un canale Slack, una conversazione via e-mail e un modulo Google inviato <Num to={30} /> giorni prima del diploma.
    </>
  ),
  'problem.p2': (
    <>
      Poteva esprimere il proprio interesse. Dopodiché <strong>il processo spariva.</strong> Uno studente non aveva modo di vedere:
    </>
  ),
  'problem.li1': 'Se una posizione fosse adatta a lui',
  'problem.li2': 'Se il suo profilo fosse stato esaminato o condiviso',
  'problem.li3': 'A che punto fosse la sua candidatura',
  'problem.li4': 'Perché non fosse idoneo',
  'problem.li5': 'Che cosa potesse fare dopo',
  'problem.p3': (
    <>
      <strong>A ognuna di queste domande si poteva rispondere. Nessuna riceveva risposta.</strong> Il lavoro del team di placement era reale e
      continuo, ma per la persona a cui era destinato restava quasi del tutto invisibile.
    </>
  ),
  'problem.q1': '«Su Slack i messaggi si perdono.»',
  'problem.p4':
    'Questa frase compare nelle note di discovery più di qualunque altra. È una lamentela piccola che descrive un problema grande: l’unico canale che collegava uno studente al proprio percorso di placement era uno che si poteva far scorrere via senza accorgersene.',
  'problem.ph1': 'Flusso dello stato attuale: canale Slack, modulo Google e processo operativo manuale',

  // ---------------------------------------------------------------- 02 Evidence
  'evidence.eyebrow': 'Evidenze',
  'evidence.category': 'Analisi quantitativa · segmentazione · definizione delle metriche',
  'evidence.questions': ['Come si sa che erano davvero questi i problemi?'],
  'evidence.artifacts': 'Valori di partenza di CSAT e NPS · cinque tipi di studente · insieme di metriche operative',
  'evidence.heading': 'Che cosa mostravano i dati',
  'evidence.st1':
    'La soddisfazione ha tenuto durante l’esperienza di apprendimento, poi è crollata proprio nel momento in cui arrivava la promessa di placement dell’azienda.',
  'evidence.p1': (
    <>
      Novatr misurava la soddisfazione dei clienti in ogni fase del percorso degli studenti. I dati hanno reso la fase di placement{' '}
      <strong>una priorità inequivocabile</strong>, mentre la riflessione successiva ha mostrato dove le sole evidenze quantitative non bastavano.
    </>
  ),
  'evidence.p2': (
    <>
      Il Net Promoter Score raccontava la stessa storia, segmento per segmento, e <strong>calava man mano che lo studente avanzava nel percorso.</strong>
    </>
  ),
  'evidence.p3':
    'La versione finale deve indicare il periodo del sondaggio, la dimensione dei campioni, la metodologia e la definizione delle scale per entrambi gli strumenti.',
  'evidence.p4': 'Il quadro operativo',
  'evidence.p5':
    'Abbiamo usato le metriche di business per dare la direzione e definire il successo. Il prodotto poteva incidere direttamente su visibilità, preparazione, candidature e velocità operativa; risultati più ampi, come la disponibilità di posizioni, dipendevano anche dal team di placement e dal mercato del lavoro.',
  'evidence.p6': (
    <>
      L’ultima riga è l’esempio più chiaro.{' '}
      <strong>Il numero di posizioni rilevanti per studente a settimana è una misura dal lato dell’offerta.</strong> Cresce quando i team
      partnership e placement portano più ruoli giusti. Il compito del portale era rendere quell’offerta visibile agli studenti giusti e il divario
      misurabile, non crearla.
    </>
  ),
  'evidence.p7': 'Chi erano davvero gli studenti',
  'evidence.p8': (
    <>
      Dalla discovery sono emersi cinque tipi di studente, e si sono rivelati la vera struttura del sistema, non un espediente di presentazione.
      Quello che ha cambiato l’impostazione del progetto:{' '}
      <strong>
        il <Num to={30} suffix="%" /> di tutti i placement era autonomo
      </strong>{' '}
      — studenti che avevano trovato lavoro da soli, in gran parte invisibili all’azienda e non riconosciuti dal prodotto.
    </>
  ),
  'evidence.li1': (
    <>
      <strong>Futuri diplomati</strong> — stanno ancora studiando; potrebbero diventare idonei o no.
    </>
  ),
  'evidence.li2': (
    <>
      <strong>Diplomati idonei</strong> — hanno concluso il percorso, espresso interesse e sono in attesa.
    </>
  ),
  'evidence.li3': (
    <>
      <strong>Candidati attivi</strong> — si sono candidati ad almeno una posizione.
    </>
  ),
  'evidence.li4': (
    <>
      <strong>Studenti inattivi</strong> — hanno espresso interesse e poi sono spariti.
    </>
  ),
  'evidence.li5': (
    <>
      <strong>Studenti inseriti in autonomia</strong> — hanno trovato lavoro da soli. Il 30% di tutti i placement.
    </>
  ),
  'evidence.p9':
    'Questi cinque sono diventati gli stati di placement del sistema rilasciato quasi senza modifiche, ed è per questo che il modello degli stati ha poi la forma che ha.',
  'evidence.ph1': 'Sintesi della ricerca, segmenti di studenti e metriche di partenza',
  'evidence.note1.label': 'Nota per la pubblicazione',
  'evidence.note2.label': 'Sull’attribuzione',
  'evidence.peek1.label': 'I cinque tipi di studente',
  'evidence.peek1.more': 'Mostra tutti e cinque',
  'evidence.bigstat1.label':
    'di tutti i placement era autonomo — in gran parte invisibile all’azienda e non riconosciuto dal prodotto',
  'evidence.tbl1.cols': [{ label: 'Fase' }, { label: 'CSAT' }],
  'evidence.tbl1.rows': [
    ['Acquisizione', '82'],
    ['Attivazione', '79.7'],
    ['Coinvolgimento', '82'],
    ['Completamento', bad('55.5')],
    ['Placement', bad('51.5')],
  ],
  'evidence.tbl2.cols': [{ label: 'Segmento' }, { label: 'NPS' }],
  'evidence.tbl2.rows': [
    ['Studenti, 0–3 mesi', '35'],
    ['Studenti, 4–7 mesi', '32'],
    ['Diplomati, inseriti', '14'],
    ['Diplomati, non inseriti', bad('−18')],
  ],
  'evidence.tbl3.cols': [{ label: 'Misura' }, { label: 'Valore di partenza' }, { label: 'Obiettivo' }],
  'evidence.tbl3.rows': [
    ['Dalla posizione online al profilo condiviso con un’azienda', bad('60+ ore'), '16 ore lavorative'],
    ['Tasso di candidatura sulle posizioni rilevanti', '46%', '70%'],
    ['Rinunce durante il processo di selezione', bad('29.6%'), '<10%'],
    ['Tasso di preselezione dei profili condivisi', '25%', '40%'],
    ['Studenti idonei tra quelli interessati', '80%', '89%'],
    ['Posizioni rilevanti per studente a settimana', '3', '5'],
  ],

  // ---------------------------------------------------------------- 03 Reframing
  'reframing.eyebrow': 'Nuova impostazione',
  'reframing.category': 'Impostazione del problema · design di sistema · strategia di ambito',
  'reframing.questions': ['Perché costruire un sistema quando era stata chiesta una pagina?'],
  'reframing.artifacts': 'Schema ECAT · vocabolario condiviso degli stati · piano di rilascio a fasi',
  'reframing.heading': 'Da una pagina di placement a un sistema',
  'reframing.st1':
    'Era stata chiesta una pagina. Le evidenze descrivevano un processo senza uno stato visibile, così ho sostenuto la necessità di un sistema.',
  'reframing.p1':
    'La differenza non è teorica. Una pagina a sé stante poteva mostrare un solo momento del processo. Questo problema richiedeva regole condivise per ogni condizione significativa, per chi la cambia e per ciò che lo studente deve capire quando cambia.',
  'reframing.p2': 'Lo schema su cui ha lavorato il team',
  'reframing.p3': (
    <>
      All’inizio ci siamo accordati su una definizione che ha retto per tutto il progetto. Abbiamo riassunto il problema degli studenti in quattro
      esigenze:{' '}
      <strong>idoneità, comunicazione, accesso e tracciamento — in inglese Eligibility, Communication, Access e Tracking, da cui ECAT.</strong>{' '}
      Ogni discussione successiva sull’ambito è stata condotta con questi termini, ed è in buona parte il motivo per cui un rilascio in tre mesi non
      si è frammentato in un backlog.
    </>
  ),
  'reframing.tbl1.cols': [{ label: 'ECAT' }, { label: 'Che cosa serviva agli studenti' }, { label: 'Che cosa è diventato' }],
  'reframing.tbl1.rows': [
    [
      <strong key="e">Idoneità (Eligibility)</strong>,
      'Sapere se si qualificano e che cosa fare se non è così',
      'Banner nella pagina del corso, schermata dei criteri, soglia su cui si può agire',
    ],
    [<strong key="c">Comunicazione (Communication)</strong>, 'Essere avvisati quando qualcosa cambia', 'Feed degli aggiornamenti e sistema di notifiche'],
    [
      <strong key="a">Accesso (Access)</strong>,
      'Vedere le posizioni davvero pensate per loro',
      'Raggruppamento per rilevanza, filtri, modello di matchmaking',
    ],
    [
      <strong key="t">Tracciamento (Tracking)</strong>,
      'Sapere a che punto è una candidatura e perché',
      'Le mie candidature, scala degli stati, motivazione dei rifiuti',
    ],
  ],
  'reframing.p4': '1. Rendere l’idoneità leggibile e praticabile, non solo imposta',
  'reframing.p5':
    'Gli studenti si qualificano tramite il completamento ponderato del corso, la partecipazione al giorno di revisione e un profilo completo. L’esigenza dell’azienda era mantenere quella soglia. La ricerca diceva che la frustrazione più forte non era essere non idonei, ma non sapere perché e non sapere che cosa fare.',
  'reframing.tbl2.cols': [{ label: 'Esigenza di business' }, { label: 'Esigenza dello studente' }, { label: 'Risposta di design' }],
  'reframing.tbl2.rows': [
    [
      'Mantenere gli standard di qualificazione',
      'Capire perché non sono idonei e come possono diventarlo',
      'Mostrare i criteri, il divario attuale e un percorso concreto per colmarlo',
    ],
  ],
  'reframing.p6': (
    <>
      Non ho sostenuto che la soglia dovesse essere più bassa. Ho sostenuto che <strong>una soglia che lo studente non può vedere è ciò che
      genera il reclamo.</strong>
    </>
  ),
  'reframing.p7': '2. Progettare un vocabolario condiviso degli stati e definizioni dei dati',
  'reframing.p8':
    'L’azienda sapeva che prima o poi avrebbe avuto bisogno di tre prodotti: un portale per gli studenti, uno strumento interno per le operations e qualcosa per le aziende partner. Definizioni scritte in modo stretto per il primo sarebbero diventate vincoli per gli altri due. Per questo idoneità, rilevanza, stato di placement e stato della candidatura sono stati specificati come definizioni di sistema e non come comportamento delle schermate: riutilizzabili, non solo sufficienti.',
  'reframing.p9': '3. Procedere per fasi e rinunciare a costruire una parte della soluzione',
  'reframing.p10':
    'Rilasciare il portale per gli studenti, perché lo studente era l’unico a non avere alcuna visibilità. Adattare Retool per le operations invece di sostituirlo, perché un rilascio in tre mesi che chiedeva anche al team operativo di cambiare strumento sarebbe fallito proprio lì. E non costruire, di proposito, un portale per le aziende partner.',
  'reframing.p11':
    'Quest’ultima scelta è stata un risultato della ricerca, non un taglio. Ogni azienda partner aveva un proprio processo di valutazione e un proprio modo di selezionare i candidati, e nessuna voleva usare il portale di una terza parte per valutare i nostri studenti. Costruirlo avrebbe significato costruire per persone che avevano detto che non lo avrebbero usato. Le candidature hanno continuato a partire via e-mail, nel formato in cui i partner già lavoravano, mentre i record strutturati dietro quelle e-mail sono stati progettati in modo che in futuro un prodotto per i partner potesse poggiarci sopra senza rimodellare nulla.',
  'reframing.peek1.label': 'Che cosa poteva e non poteva fare lo strumento operativo',
  'reframing.p12': (
    <>
      Retool è organizzato per azienda e per posizione. Uno studente vi esiste solo come riga di candidato sotto un annuncio, il che significa che non
      c’era una vista in grado di rispondere a <em>«come sta andando questo studente nel complesso?»</em>, esattamente la visibilità che chiedeva
      uno dei nostri obiettivi.
    </>
  ),
  'reframing.p13':
    'Quel divario è l’argomento più forte a favore dello strumento interno che era sempre previsto, ed è la prima cosa che ci metterei.',
  'reframing.ph1': 'Framework decisionale o workshop che mostra i vincoli degli studenti, del business e delle operations',

  // ---------------------------------------------------------------- 04 Leadership
  'leadership.eyebrow': 'Leadership',
  'leadership.category': 'Gestione del design · coaching · allineamento degli stakeholder',
  'leadership.questions': ['Che cosa hai fatto tu e che cosa ha fatto la tua designer?'],
  'leadership.artifacts': 'Cadenza delle revisioni · principi decisionali · ripartizione delle responsabilità',
  'leadership.heading': 'Come ho guidato il lavoro',
  'leadership.p1':
    'Sanya ha curato il design di prodotto nel dettaglio. Era il suo primo grande progetto in azienda e i flussi, le schermate, gli stati e la documentazione sono suoi, così accurati che l’intero prodotto resta comprensibile da lì a distanza di anni. Rispondeva a me.',
  'leadership.tbl1.cols': [
    { label: 'Il mio ruolo — Manik, Product Design Manager' },
    { label: 'Product Designer — Sanya' },
    { label: 'Product manager e operations' },
  ],
  'leadership.tbl1.rows': [
    [
      'Impostazione del problema, principi decisionali, pensiero sistemico, direzione del design, indicazioni sul design system, allineamento degli stakeholder, revisioni di qualità e strategia di consegna',
      'Flussi degli studenti, interaction e visual design, realizzazione degli stati, documentazione dettagliata, componenti e consegna all’ingegneria',
      'Ambito, obiettivi di business, decisioni di roadmap, fattibilità operativa e vincoli di implementazione',
    ],
  ],
  'leadership.p2': 'Il coaching che ha cambiato il lavoro',
  'leadership.q1':
    'All’inizio il lavoro trattava l’esperienza di placement come una sequenza di schermate. Nelle revisioni ho introdotto una domanda sul modello degli stati: «Che cosa deve essere vero per questo studente perché compaia questa schermata, e che cosa deve capire o fare dopo?» Questo ha spostato il lavoro dal design delle pagine a stati di sistema espliciti, producendo definizioni riutilizzabili di idoneità, stato di placement, rilevanza e stato della candidatura.',
  'leadership.p3':
    'Quella domanda è stata un contributo di leadership centrale al progetto. Ha trasformato una collezione crescente di schermate in un insieme circoscritto di condizioni e ha dato a Sanya un metodo da applicare in autonomia nei lavori successivi.',
  'leadership.p4': (
    <>
      Era il primo progetto end-to-end di Sanya con una forte componente di sistema. Alla fine <strong>sapeva modellare da sola stati di prodotto
      complessi</strong>, una capacità rimasta al team ben oltre questo rilascio.
    </>
  ),
  'leadership.p5': 'Dove si è tenuto l’equilibrio',
  'leadership.p6':
    'Abbiamo usato revisioni di design regolari per verificare le decisioni alla luce delle evidenze sugli studenti, sciogliere i dubbi sul modello degli stati e tenere la consegna all’ingegneria allineata al sistema anziché alle singole schermate.',
  'leadership.p7':
    'Il design era presente per rappresentare lo studente, il product management per rappresentare il business. La versione produttiva non è un braccio di ferro: ciascuna parte deve mostrare perché una decisione discende da ciò che gli studenti hanno davvero fatto. I miei interventi erano quasi sempre la stessa mossa: prendere una decisione presa a intuito e rimandarla alle evidenze.',
  'leadership.p8':
    'Una cosa che ho sostenuto e non ho ottenuto: un feed davvero personalizzato, che ordina le posizioni per affinità e comportamento invece di filtrarle con regole. Richiedeva un ampio insieme di variabili per studente tracciate fin dal primo giorno, e la posizione condivisa era che fosse troppo per l’ambito iniziale. È stata una scelta ragionevole per un rilascio in tre mesi, e la farei anch’io dal punto di vista del product manager.',
  'leadership.ph1': 'Esempio di revisione o critica di design che mostra la domanda sul modello degli stati applicata a un lavoro reale',

  // ---------------------------------------------------------------- 05 The product
  'product.eyebrow': 'Il prodotto',
  'product.category': 'Interaction design · content design · modellazione degli stati',
  'product.questions': ['Che cosa vedeva davvero uno studente, e perché proprio quello?'],
  'product.artifacts': 'Banner dinamico · flusso di interesse e idoneità · posizioni e tracciamento · tre epiloghi',
  'product.heading': 'Rendere visibili lo stato e i prossimi passi',
  'product.st1': 'Ogni schermata rispondeva a due domande: a che punto sono, e che cosa succede dopo?',
  'product.note1.label': 'Prototipo interattivo',
  'product.p1': (
    <>
      Il prototipo funzionante è online in cima a questa pagina e tutto ciò che c’è nei quattro momenti qui sotto è al suo interno. Scorri e clicca
      nel riquadro, oppure <a href="#prototype">torna su al prototipo</a>.
    </>
  ),
  'product.p2': 'Quattro momenti',
  'product.p3': (
    <>
      <strong>1. Il banner nella pagina del corso.</strong> Il portale non ha una porta d’ingresso. Lo studente ci arriva attraverso un unico
      banner nella pagina del suo corso, che si presenta in modo diverso a seconda del punto in cui si trova: verifica la tua idoneità, compila il
      modulo di interesse, hai completato il percorso, conto alla rovescia per lo sblocco, sbloccato, non idoneo, hai detto di non essere
      interessato. È stato il primo componente specificato, perché è l’unica cosa che garantisce che il prodotto incontri lo studente ovunque si
      trovi.
    </>
  ),
  'product.ph1': 'Banner dinamico nei principali stati',
  'product.p4': (
    <>
      <strong>2. Idoneità e interesse.</strong> Criteri mostrati per intero, il divario attuale dello studente indicato con chiarezza e, in ogni
      schermata che dice di no, una strada per colmarlo. Il modulo di interesse ha sostituito il modulo Google: aspettative di retribuzione,
      preavviso, sede preferita, disponibilità a trasferirsi, specializzazione e consenso esplicito a condividere il profilo con le aziende partner,
      con un avviso in linguaggio semplice che completarlo non garantisce un lavoro.
    </>
  ),
  'product.p5': (
    <>
      <strong>3. Opportunità rilevanti.</strong> Posizioni raggruppate per rilevanza, con il numero, così lo studente vede quanta parte della bacheca
      è davvero per lui. La sede è un criterio <em>morbido</em>: una posizione fuori dalla preferenza indicata non viene nascosta né bloccata; lo
      studente viene informato e decide. Con <Num to={14} /> casi registrati di studenti che avevano accettato un’offerta per poi rifiutarla a causa
      della sede, nascondere quelle posizioni sarebbe stata la risposta facile e sbagliata.
    </>
  ),
  'product.p6': (
    <>
      <strong>4. Tracciamento ed epilogo.</strong> I motivi accompagnano la candidatura a ogni fase: un profilo non condiviso ne spiega il perché, un
      rifiuto riporta la ragione comunicata. E il percorso ha una conclusione progettata, comunque vada.
    </>
  ),
  'product.seq1': [
    {
      alt: 'La bacheca delle offerte: schede «All Jobs», «Featured», «Relevant» con un conteggio ed «Expired», poi le card delle posizioni con azienda, ruolo, verifiche su titolo di studio ed esperienza, sede e tempo rimasto per candidarsi.',
      label: 'Trovare una posizione',
      caption:
        'Le posizioni sono raggruppate per rilevanza con un conteggio, e ogni card mostra le verifiche su titolo di studio ed esperienza, la sede e quanto tempo resta per candidarsi.',
    },
    {
      alt: 'La descrizione di una posizione: azienda e ruolo, la corrispondenza di titolo di studio ed esperienza dello studente, un banner con la scadenza e il pulsante «Apply Now», poi «About the Job» e «Role Accountabilities».',
      label: 'Verificare la corrispondenza, poi candidarsi',
      caption: 'Prima il confronto con i requisiti, poi un’unica azione successiva chiara.',
    },
    {
      alt: 'Tracker della candidatura intitolato «Your Journey with AECOM Architects»: «Applied», «Profile Shared» e «Profile Shortlisted» risultano raggiunti, mentre «Selected for interview», «Offer Received» e «Offer Accepted» devono ancora arrivare.',
      label: 'Seguire la candidatura',
      caption: 'Ogni fase raggiunta da una candidatura è segnata, e ciò che viene dopo resta visibile.',
    },
    {
      alt: 'Conferma dopo l’accettazione di un’offerta: un’illustrazione, il messaggio «Congratulations, you’ve accepted the offer from AECOM Architects» e un controllo a cinque stelle «Rate Experience».',
      label: 'Accettare l’offerta',
      caption: 'Accettare, confermare, festeggiare, poi valutare l’esperienza.',
    },
  ],
  'product.p7': 'Tre epiloghi',
  'product.p8': (
    <>
      <strong>Inserito.</strong> Accettare, confermare, festeggiare, poi valutare l’esperienza e raccontare la propria storia. Dopodiché il prodotto
      limita di proposito l’accesso al resto di sé, perché chi ha trovato lavoro non ha bisogno di annunci.
    </>
  ),
  'product.p9': (
    <>
      <strong>Inserito in autonomia.</strong> «Raccontaci la tua novità professionale»: azienda, ruolo, sede. Un passaggio breve, rivolto al{' '}
      <Num to={30} suffix="%" /> degli esiti che prima erano invisibili all’azienda e non riconosciuti per lo studente.
    </>
  ),
  'product.p10': (
    <>
      <strong>Non inserito.</strong> Quando la finestra si chiude senza un placement, lo studente non viene disconnesso né fatto scadere in silenzio.
      Trova una pagina che dice che la ricerca sta per chiudersi, riconosce la difficoltà, gli dice che il suo impegno è contato e gli chiede che
      cosa si sarebbe potuto fare meglio.
    </>
  ),
  'product.p11': (
    <>
      Una regola dentro quell’epilogo merita di essere detta a parte, perché è stata la decisione più umana del progetto ed esiste solo come nota
      sulla lavagna della consegna: <strong>uno studente non può perdere l’accesso al portale finché è a metà del processo.</strong> La chiusura
      della finestra non è mai stata assoluta.
    </>
  ),
  'product.gal1': [
    {
      alt: 'Conferma dopo l’accettazione di un’offerta: un’illustrazione, il messaggio «Congratulations, you’ve accepted the offer from AECOM Architects» e un controllo a cinque stelle «Rate Experience».',
      caption: 'Inserito. Accettare, confermare, festeggiare, poi valutare l’esperienza.',
    },
    {
      alt: 'Una card con la scritta «Got placed with your own hard work?» e un link, «Share your triumphs with us», sopra un’illustrazione festosa.',
      caption: 'Inserito in autonomia. «Got placed with your own hard work?» invita lo studente a condividere la novità.',
    },
    {
      placeholder: 'Non inserito — la pagina di chiusura della finestra',
      caption: 'Non inserito. La ricerca sta per chiudersi e allo studente si chiede che cosa si sarebbe potuto fare meglio.',
    },
  ],
  'product.p12': 'Il sistema sottostante',
  'product.p13':
    'L’esperienza visibile poggiava su un modello degli stati definito. La schermata più complessa risolveva più condizioni indipendenti (rilevanza, idoneità e stato della candidatura), così l’ingegneria riceveva regole e combinazioni, non screenshot isolati.',
  'product.peek1.label': 'Il modello degli stati per intero',
  'product.peek1.more': 'Mostra tutti e sei gli input',
  'product.p14': 'Ciò che uno studente doveva vedere derivava da sei input:',
  'product.li1': (
    <>
      <strong>Fase del percorso</strong> — a che punto è nel corso, dalla modalità di apprendimento al diploma
    </>
  ),
  'product.li2': (
    <>
      <strong>Idoneità</strong> — non ancora valutata, idoneo o non idoneo
    </>
  ),
  'product.li3': (
    <>
      <strong>Completezza del profilo</strong> — curriculum e portfolio caricati oppure no
    </>
  ),
  'product.li4': (
    <>
      <strong>Stato di placement</strong> — la posizione complessiva dello studente: inserito, inserito in autonomia, rinunciatario ed escluso
    </>
  ),
  'product.li5': (
    <>
      <strong>Stato per candidatura</strong> — da candidato a inserito, con ogni motivo di uscita definito
    </>
  ),
  'product.li6': (
    <>
      <strong>Disponibilità e rilevanza delle posizioni</strong> — se esistono posizioni e se ce n’è qualcuna rilevante per questo studente
    </>
  ),
  'product.p15':
    'Ognuno è stato specificato come definizione e non come comportamento di una schermata, così lo stesso vocabolario poteva passare allo strumento operativo e, più avanti, a un prodotto rivolto ai partner.',
  'product.seq2': [
    {
      alt: 'Schermata di una posizione rilevante: titolo di studio ed esperienza corrispondono, un banner verde con il conto alla rovescia della scadenza e il pulsante «Apply Now».',
      label: 'Rilevante, candidatura aperta',
      caption: 'Idoneità confermata e una scadenza che scorre.',
    },
    {
      alt: 'Schermata di un ruolo non adatto: il titolo di studio è segnato come non corrispondente e un pulsante «Share concern» sostituisce «Apply Now».',
      label: 'Non adatto',
      caption: 'Il requisito non soddisfatto è segnato e lo studente può sollevare un dubbio.',
    },
    {
      alt: 'Schermata di una posizione scaduta: un banner «No longer accepting applications» e un pulsante «Apply Now» disattivato.',
      label: 'Scaduta',
      caption: 'Le candidature sono chiuse e l’azione è disattivata.',
    },
    {
      alt: 'Schermata di una candidatura in corso: un badge di stato «In Process» e un messaggio che indica che la candidatura è in esame.',
      label: 'Candidato, in corso',
      caption: 'Lo stato è dichiarato e, al posto dell’azione di candidatura, c’è ciò che sta accadendo.',
    },
  ],
  'product.p16':
    'Una conseguenza strutturale merita di essere nominata. La schermata di descrizione della posizione ha finito per svolgere due compiti senza relazione tra loro: valutare una posizione a cui lo studente non si è ancora candidato e tracciare una candidatura già in corso. È stata rilasciata e ha funzionato, ma separare quei compiti in due superfici è la prima modifica che farei oggi.',

  // ---------------------------------------------------------------- 06 Handover
  'handover.eyebrow': 'Passaggio di consegne',
  'handover.category': 'Design system · documentazione · consegna all’ingegneria',
  'handover.questions': ['Come è arrivato all’ingegneria senza perdere la sua logica?'],
  'handover.artifacts': '63 stati annotati · ~45 componenti · libreria mobile · journey board e state board',
  'handover.heading': 'Specificato per essere costruito e per costruirci sopra',
  'handover.p1':
    'La consegna era pensata per due pubblici: gli ingegneri che lo costruivano allora e chi, dopo, avrebbe costruito il prodotto successivo sopra di esso.',
  'handover.p2': (
    <>
      <Num to={63} /> stati di schermata, ciascuno annotato con la condizione che lo produce. Circa <Num to={45} /> componenti con note per gli sviluppatori.{' '}
      <Num to={5} /> journey board che collegano il flusso alle schermate, dalla modalità di apprendimento fino al diploma, <Num to={6} /> state board che
      coprono ogni superficie e un set mobile parallelo completo con una propria libreria di componenti, tutto costruito sul design system LMS già esistente di
      Novatr anziché su uno nuovo.
    </>
  ),
  'handover.p3':
    'La parte che contava oltre questo rilascio era il vocabolario. La scala degli stati, i criteri di rilevanza e il modello di idoneità sono stati consegnati come definizioni di sistema e non come comportamento delle schermate, così lo strumento operativo e qualsiasi futuro prodotto per i partner potevano adottarli invece di inventare versioni concorrenti.',
  'handover.stats1': [
    { label: 'stati di schermata annotati' },
    { label: 'componenti con note per gli sviluppatori' },
    { label: 'journey board' },
    { label: 'state board' },
  ],
  'handover.peek1.label': 'Che cosa c’era nella consegna',
  'handover.li1': (
    <>
      <strong>63</strong> stati di schermata annotati
    </>
  ),
  'handover.li2': (
    <>
      <strong>~45</strong> componenti con note per gli sviluppatori
    </>
  ),
  'handover.li3': (
    <>
      <strong>5</strong> journey board, con il flusso collegato alle schermate
    </>
  ),
  'handover.li4': (
    <>
      <strong>6</strong> state board — home, posizioni, candidature, descrizioni delle posizioni, pop-up, aggiornamenti
    </>
  ),
  'handover.li5': 'Set mobile parallelo completo e libreria di componenti',
  'handover.li6': 'Esteso a partire dal design system LMS esistente',
  'handover.ph1': 'Lavagna della consegna annotata alla massima panoramica e libreria dei componenti con note per gli sviluppatori',

  // ---------------------------------------------------------------- 07 Launch and measurement
  'launch.eyebrow': 'Lancio e misurazione',
  'launch.category': 'Progettazione della misurazione · analisi dei risultati · retrospettiva',
  'launch.questions': ['Ha funzionato e che cosa faresti diversamente?'],
  'launch.artifacts': 'Set di valori di partenza e risultati · confini dell’attribuzione · elenco delle modifiche',
  'launch.heading': 'Che cosa è stato lanciato, che cosa abbiamo misurato e che cosa cambierei',
  'launch.p1':
    'Il portale è andato online per le coorti in uscita e la soddisfazione nella fase di placement è stata poi misurata in continuo con gli stessi strumenti che avevano prodotto i valori di partenza, così il prima e il dopo sono direttamente confrontabili.',
  'launch.tbl1.cols': [{ label: 'Misura' }, { label: 'Valore di partenza' }, { label: 'Dopo*' }, { label: 'Influenza prevista' }],
  'launch.tbl1.rows': [
    ['CSAT nella fase di placement', bad('51.5'), good('68.2'), 'Visibilità chiara di stato, idoneità e prossimi passi'],
    ['NPS, diplomati inseriti', '14', good('31'), 'Migliore chiusura, fiducia e senso di festa'],
    ['NPS, diplomati non inseriti', bad('−18'), good('−3'), 'Un epilogo riconosciuto e informativo al posto del silenzio'],
    ['Dalla posizione al profilo condiviso', bad('60+ ore'), good('14,5 ore lavorative'), 'Record strutturati e un flusso operativo più chiaro'],
    ['Tasso di candidatura sulle posizioni rilevanti', '46%', good('66%'), 'Raggruppamento per rilevanza, scadenze più chiare e visibilità dello stato'],
    ['Rinunce durante il processo di selezione', bad('29.6%'), good('13.2%'), 'Aspettative meglio definite e conseguenze visibili'],
    ['Tasso di preselezione dei profili condivisi', '25%', good('37%'), 'Migliore preparazione e verifiche di rilevanza'],
    ['Studenti idonei tra quelli interessati', '80%', good('87%'), 'Criteri di idoneità su cui si può agire e suggerimenti di preparazione'],
  ],
  'launch.note1.label': '*Numeri segnaposto/illustrativi · Nota di bozza',
  'launch.p2':
    'Tutte le cifre successive al lancio qui sopra sono segnaposto illustrativi per questa bozza. Prima della pubblicazione vanno sostituiti con risultati verificati, date, dimensione della coorte, dimensione del campione del sondaggio e metodologia di misurazione.',
  'launch.p3': (
    <>
      C’è un’affermazione che questo caso di studio non fa: <strong>che il portale abbia aumentato il numero di posizioni disponibili.</strong>
    </>
  ),
  'launch.q1':
    'Il portale ha reso visibile l’offerta di opportunità e misurabili i divari; ampliare l’offerta di ruoli rilevanti è rimasta una responsabilità delle operations e delle partnership.',
  'launch.ph1': 'Misurazione dopo il lancio — report di CSAT o NPS, oppure la dashboard con cui lavorava il team di placement',
  'launch.p4': 'Che cosa cambierei',
  'launch.li1': (
    <>
      <strong>Separare la valutazione delle posizioni dal tracciamento delle candidature in corso.</strong> Due superfici, due compiti, molte meno
      condizioni su ciascuna.
    </>
  ),
  'launch.li2': (
    <>
      <strong>Conciliare le regole di esclusione progressiva e di rifiuto immediato non valido.</strong> Un unico modello di conseguenze, dichiarato
      fin dall’inizio, così che lo studente sappia sempre quali regole valgono per lui.
    </>
  ),
  'launch.li3': (
    <>
      <strong>Creare una griglia di criteri per le decisioni umane che incidono sull’accesso degli studenti a un servizio a pagamento.</strong>{' '}
      Giudizi così rilevanti non dovrebbero poggiare sulla lettura di una sola persona, senza criteri né precedenti.
    </>
  ),
  'launch.li4': (
    <>
      <strong>Spiegare perché una posizione non è considerata rilevante, non solo che non lo è.</strong> I motivi accompagnano una candidatura
      quando è in corso; dovrebbero accompagnarla anche prima.
    </>
  ),
  'launch.li5': (
    <>
      <strong>Eliminare gli stati di navigazione vuoti o non supportati.</strong> Abbiamo rilasciato una sezione che non ha mai avuto contenuti.
    </>
  ),
  'launch.li6': (
    <>
      <strong>Fare interviste primarie ai diplomati non inseriti all’inizio del progetto.</strong> Quel gruppo rispondeva ai sondaggi con la metà
      della frequenza degli studenti attuali, quindi le persone che più avevamo bisogno di ascoltare erano le meno rappresentate nei dati che
      abbiamo usato.
    </>
  ),
  'launch.p5': 'Riflessione',
  'launch.q2':
    'Il risultato più importante non è stato solo un portale. È stato un linguaggio condiviso per un processo di placement che prima esisteva come un insieme di azioni umane scollegate. Quella base ha reso subito più chiara l’esperienza degli studenti e ha reso più semplice costruire in modo responsabile i futuri prodotti per le operations, per i partner e per la personalizzazione.',
  'launch.p6': (
    <>
      <b>Placement Hub · Novatr</b>
      <br />
      Design leadership: Manik Madaan · Product design: Sanya · Product management: Swati
    </>
  ),

  // ---------------------------------------------------------------- the 2-minute story
  'story.problem.kicker': 'Il problema',
  'story.problem.title': 'Il supporto al placement era invisibile.',
  'story.problem.body':
    'Gli studenti avevano acquistato il supporto al placement. Quello che trovavano era un canale Slack, una conversazione via e-mail e un modulo Google, e dopo il processo si faceva buio.',
  'story.problem.label': 'Che cosa lo studente non poteva vedere',
  'story.problem.rows': ['Se una posizione fosse adatta a lui', 'Se il suo profilo fosse stato condiviso', 'A che punto fosse la sua candidatura', 'Perché non fosse idoneo', 'Che cosa fare dopo'],
  'story.problem.footer': '«Su Slack i messaggi si perdono.»',
  'story.evidence.kicker': 'Evidenze',
  'story.evidence.title': 'La soddisfazione è crollata esattamente dove arrivava la promessa.',
  'story.evidence.body':
    'Ha tenuto durante l’apprendimento, poi è scesa al placement. Il Net Promoter Score raccontava la stessa storia e calava man mano che lo studente avanzava.',
  'story.evidence.label': 'Soddisfazione (CSAT) per fase',
  'story.evidence.rows': [['Acquisizione', 82], ['Attivazione', 79.7], ['Coinvolgimento', 82], ['Completamento', 55.5, true], ['Placement', 51.5, true]],
  'story.evidence.callout': 'NPS tra i diplomati non inseriti:',
  'story.reframing.kicker': 'Nuova impostazione',
  'story.reframing.title': 'Era stata chiesta una pagina. Le evidenze descrivevano un sistema.',
  'story.reframing.body':
    'Una pagina poteva mostrare un momento. Il problema richiedeva regole condivise per ogni condizione, per chi la cambia e per ciò che lo studente deve capire quando cambia.',
  'story.reframing.text': 'dei placement era autonomo, invisibile all’azienda e non riconosciuto dal prodotto',
  'story.reframing.pillsLabel': 'Lo schema su cui abbiamo lavorato: ECAT',
  'story.reframing.pills': ['Idoneità (Eligibility)', 'Comunicazione (Communication)', 'Accesso (Access)', 'Tracciamento (Tracking)'],
  'story.leadership.kicker': 'Leadership',
  'story.leadership.title': 'Una domanda ha cambiato il modo di lavorare.',
  'story.leadership.body':
    'Sanya ha curato il design nel dettaglio; io l’impostazione, i principi e le revisioni. Porre questa domanda a ogni revisione ha trasformato un mucchio di schermate in un insieme circoscritto di stati.',
  'story.leadership.quote': '«Che cosa deve essere vero per questo studente perché compaia questa schermata, e che cosa deve capire o fare dopo?»',
  'story.leadership.caption': 'Schermate → stati espliciti → definizioni condivise',
  'story.product.kicker': 'Il prodotto',
  'story.product.title': 'Ogni schermata risponde: a che punto sono e che cosa succede dopo?',
  'story.product.body':
    'La stessa schermata della posizione cambia a seconda dello studente: il requisito non soddisfatto è indicato, la scadenza scorre, l’azione da compiere è sempre chiara.',
  'story.product.states': [
    { label: 'Rilevante, candidatura aperta', alt: 'Schermata di una posizione rilevante con il pulsante «Apply Now».' },
    { label: 'Non adatto', alt: 'Schermata di un ruolo non adatto con il pulsante «Share concern».' },
    { label: 'Scaduta', alt: 'Schermata di una posizione scaduta con il pulsante «Apply Now» disattivato.' },
    { label: 'Candidato, in corso', alt: 'Schermata di una candidatura in corso.' },
  ],
  'story.handover.kicker': 'Passaggio di consegne',
  'story.handover.title': 'Specificato per essere costruito e per costruirci sopra.',
  'story.handover.body':
    'Stato, rilevanza e idoneità sono stati consegnati come definizioni di sistema, così lo strumento operativo e qualsiasi prodotto per i partner potevano adottarli invece di inventarne di propri.',
  'story.handover.stats': [
    { label: 'stati di schermata annotati' },
    { label: 'componenti con note per gli sviluppatori' },
    { label: 'journey board' },
    { label: 'state board' },
  ],
  'story.launch.kicker': 'Lancio e misurazione',
  'story.launch.title': 'Che cosa è stato lanciato e che cosa abbiamo misurato.',
  'story.launch.body':
    'Misurato con gli stessi strumenti dei valori di partenza. C’è un’affermazione che questo caso di studio non fa: che il portale abbia creato più posizioni.',
  'story.launch.rows': [
    ['CSAT nella fase di placement', '51,5', '68,2'],
    ['NPS, diplomati non inseriti', '−18', '−3'],
    ['Rinunce durante la selezione', '29,6%', '13,2%'],
  ],
  'story.launch.footnote': '*Cifre illustrative in questa bozza — da sostituire con risultati verificati',
};
