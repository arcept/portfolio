// German: the Placement Hub case study. Each key is the English piece it replaces (see sections.js, PlacementBody.js and
// PlacementStory.js); a key left out simply shows the English. Written to read as German, not as a translation:
// the register is professional ("Sie"), gender-neutral participles are used for people ("Lernende", "Absolvierende"),
// tool and product names stay as they are, and figures use the decimal comma (the counters format themselves).
import Num from '@/components/case-study-kit/Num';
import { bad, good } from './helpers';

export default {
  // ---------------------------------------------------------------- page
  'meta.title': 'Vermittlung sichtbar machen — Manik Madaan',
  'hero.back': 'Zurück zu allen Arbeiten',
  'hero.eyebrow': 'Fallstudie · Product-Design-Leadership',
  'hero.headline': 'Den Vermittlungsprozess der größten AEC-Bildungsplattform Indiens für Lernende sichtbar machen',
  'hero.lede':
    'Lernende hatten Unterstützung bei der Jobvermittlung gebucht, erlebten sie aber als Blackbox. Ich habe die Design-Richtung für ein Lernendenportal und ein wiederverwendbares Vermittlungssystem verantwortet, das Fortschritt, Berechtigung, Möglichkeiten und nächste Schritte sichtbar macht.',
  'hero.moreLabel': 'Umfang, Team und Zeitplan',
  'hero.lead': [
    { label: 'Rolle', value: 'Product Design Manager / Design Lead' },
    { label: 'Unternehmen', value: 'Novatr, ein Bildungsunternehmen für die AEC-Branche' },
    { label: 'Produkt', value: 'Vermittlungsportal' },
  ],
  'hero.more': [
    {
      label: 'Umfang',
      value:
        'Lernendenportal, Anpassungen der Retool-Workflows für den Betrieb sowie wiederverwendbare Status- und Datengrundlagen für künftige interne Produkte und Produkte für Hiring-Partner',
    },
    {
      label: 'Team',
      value:
        'Manik Madaan, Product Design Manager · Sanya, Product Designer · Swati, Product Manager · Vermittlungsbetrieb und Engineering',
    },
    { label: 'Zeitplan', value: 'Etwa drei Monate bis zum Launch' },
  ],
  'hero.story': 'Die 2-Minuten-Version lesen',
  'hero.coverAlt':
    'Startseite von Placement Hub mit geöffnetem Updates-Panel, das Bewerbungsupdates und neue Möglichkeiten auflistet, darüber die Banner zu Berechtigung und Interessenformular.',
  'proto.versions': [
    {
      eyebrow: 'Interaktiver Prototyp · Placement Hub',
      description:
        'Ein funktionierender Prototyp der Vermittlungserfahrung: Startseite, Jobbörse, Stellenbeschreibungen, Bewerbungen und das Interessenformular. Jeder Bewerbungsstatus ist live – mit dem Becherglas-Button unten rechts im Frame schlüpfen Sie in die Rolle des Vermittlungsteams und führen eine Bewerbung durch ihre Phasen.',
    },
  ],
  'proto.title': 'Interaktiver Prototyp von Placement Hub',
  'proto.heading': 'Placement Hub live erleben',
  'proto.note':
    'Alle Beispieldaten sind synthetisch. Scrollen und klicken Sie im Frame – es ist der vollständige Prototyp, nur eingerahmt. Probieren Sie das Interessenformular im Banner der Startseite aus, bewerben Sie sich auf eine Stelle oder öffnen Sie den Becherglas-Button, um eine Bewerbung durch ihre Phasen zu führen.',
  'proto.mobileAlt':
    'Startseite von Placement Hub mit dem Banner zur Berechtigung, dem Banner zum Interessenformular und den laufenden Bewerbungen der Lernenden',
  'nav.sections': [
    { label: 'Das Problem' },
    { label: 'Belege' },
    { label: 'Neurahmung' },
    { label: 'Führung' },
    { label: 'Das Produkt' },
    { label: 'Übergabe' },
    { label: 'Launch und Messung' },
  ],
  'footer.all': 'Alle Arbeiten',
  'footer.contact': 'Kontakt aufnehmen',

  // ---------------------------------------------------------------- 01 The problem
  'problem.eyebrow': 'Das Problem',
  'problem.category': 'Discovery · Stakeholder-Interviews · Prozesskartierung',
  'problem.questions': ['Was war eigentlich kaputt – und für wen?'],
  'problem.artifacts': 'Journey Map des Ist-Zustands · Problemdefinitionen · Übersicht der Schmerzpunkte der Lernenden',
  'problem.heading': 'Die Vermittlungsunterstützung war unsichtbar',
  'problem.p1': (
    <>
      Wer einen Kurs bei Novatr abschloss, hatte die Unterstützung bei der Jobvermittlung bereits gebucht – sie gehörte zum Kursversprechen.
      Erlebt haben die Lernenden dann einen Slack-Kanal, einen E-Mail-Verlauf und ein Google-Formular, das <Num to={30} /> Tage vor dem
      Abschluss verschickt wurde.
    </>
  ),
  'problem.p2': (
    <>
      Interesse bekunden konnten sie. Danach <strong>verschwand der Prozess.</strong> Lernende hatten keine Möglichkeit zu sehen:
    </>
  ),
  'problem.li1': 'Ob eine Stelle zu ihnen passte',
  'problem.li2': 'Ob ihr Profil geprüft oder weitergegeben wurde',
  'problem.li3': 'Wo ihre Bewerbung stand',
  'problem.li4': 'Warum sie nicht berechtigt waren',
  'problem.li5': 'Was sie als Nächstes tun konnten',
  'problem.p3': (
    <>
      <strong>Jede dieser Fragen ließe sich beantworten. Keine davon wurde beantwortet.</strong> Die Arbeit des Vermittlungsteams war real und
      kontinuierlich, doch für die Menschen, für die sie geleistet wurde, blieb sie fast unsichtbar.
    </>
  ),
  'problem.q1': '„Nachrichten gehen in Slack unter.“',
  'problem.p4':
    'Dieser Satz kommt in den Discovery-Notizen häufiger vor als jeder andere. Es ist eine kleine Klage über ein großes Problem: Der einzige Kanal, der Lernende mit ihrem eigenen Vermittlungsprozess verband, war einer, an dem man leicht vorbeiscrollen konnte.',
  'problem.ph1': 'Ablauf im Ist-Zustand – Slack-Kanal, Google-Formular und manueller Betriebsprozess',

  // ---------------------------------------------------------------- 02 Evidence
  'evidence.eyebrow': 'Belege',
  'evidence.category': 'Quantitative Analyse · Segmentierung · Definition von Kennzahlen',
  'evidence.questions': ['Woher weiß man, dass das die eigentlichen Probleme waren?'],
  'evidence.artifacts': 'CSAT- und NPS-Ausgangswerte · fünf Lernendentypen · operatives Kennzahlenset',
  'evidence.heading': 'Was die Daten zeigten',
  'evidence.st1':
    'Die Zufriedenheit blieb während des Lernens stabil und brach genau in dem Moment ein, in dem das Vermittlungsversprechen des Unternehmens fällig wurde.',
  'evidence.p1': (
    <>
      Novatr erhob die Kundenzufriedenheit in jeder Phase der Lernreise. Die Daten machten die Vermittlungsphase zu{' '}
      <strong>einer eindeutigen Priorität</strong>; zugleich zeigte die spätere Reflexion, wo quantitative Belege allein nicht ausreichten.
    </>
  ),
  'evidence.p2': (
    <>
      Der Net Promoter Score erzählte dieselbe Geschichte, aufgeschlüsselt nach Segmenten – und er{' '}
      <strong>sank, je weiter eine Person auf der Reise kam.</strong>
    </>
  ),
  'evidence.p3':
    'In der endgültigen Fassung müssen Erhebungszeitraum, Stichprobengrößen, Methodik und Skalendefinitionen beider Instrumente angegeben werden.',
  'evidence.p4': 'Das operative Bild',
  'evidence.p5':
    'Wir haben Geschäftskennzahlen genutzt, um die Richtung vorzugeben und Erfolg zu definieren. Das Produkt konnte Sichtbarkeit, Bereitschaft, Bewerbungen und operative Geschwindigkeit direkt beeinflussen; weiterreichende Ergebnisse wie das Stellenangebot hingen auch vom Vermittlungsteam und vom Arbeitsmarkt ab.',
  'evidence.p6': (
    <>
      Die letzte Zeile ist das klarste Beispiel.{' '}
      <strong>Relevante Stellen pro Lernendem und Woche sind eine Kennzahl der Angebotsseite.</strong> Sie steigt, wenn die Partnerschafts- und
      Vermittlungsteams mehr passende Stellen hereinholen. Aufgabe des Portals war es, dieses Angebot für die richtigen Lernenden sichtbar und
      die Lücke messbar zu machen – nicht, es zu schaffen.
    </>
  ),
  'evidence.p7': 'Wer die Lernenden tatsächlich waren',
  'evidence.p8': (
    <>
      Aus der Discovery gingen fünf Lernendentypen hervor, und sie erwiesen sich als die eigentliche Struktur des Systems, nicht als
      Präsentationshilfe. Der Typ, der den Auftrag neu gerahmt hat:{' '}
      <strong>
        <Num to={30} suffix="%" /> aller Vermittlungen waren Eigenvermittlungen
      </strong>{' '}
      – Lernende, die ihre Stelle selbst gefunden hatten, für das Unternehmen weitgehend unsichtbar und vom Produkt nicht gewürdigt.
    </>
  ),
  'evidence.li1': (
    <>
      <strong>Angehende Absolvierende</strong> – lernen noch; werden vielleicht berechtigt, vielleicht nicht.
    </>
  ),
  'evidence.li2': (
    <>
      <strong>Berechtigte Absolvierende</strong> – Abschluss erreicht, Interesse bekundet, warten.
    </>
  ),
  'evidence.li3': (
    <>
      <strong>Aktive Bewerbende</strong> – haben sich auf mindestens eine Stelle beworben.
    </>
  ),
  'evidence.li4': (
    <>
      <strong>Inaktive Lernende</strong> – haben Interesse bekundet und sind dann verschwunden.
    </>
  ),
  'evidence.li5': (
    <>
      <strong>Eigenvermittelte Lernende</strong> – haben selbstständig eine Stelle gefunden. 30 % aller Vermittlungen.
    </>
  ),
  'evidence.p9':
    'Diese fünf wurden im ausgelieferten System fast unverändert zu den Vermittlungsstatus – deshalb hat das Zustandsmodell später die Form, die es hat.',
  'evidence.ph1': 'Forschungssynthese, Lernendensegmente und Ausgangskennzahlen',
  'evidence.note1.label': 'Hinweis zur Veröffentlichung',
  'evidence.note2.label': 'Zur Zuordnung',
  'evidence.peek1.label': 'Die fünf Lernendentypen',
  'evidence.peek1.more': 'Alle fünf anzeigen',
  'evidence.bigstat1.label':
    'aller Vermittlungen waren Eigenvermittlungen – für das Unternehmen weitgehend unsichtbar und vom Produkt nicht gewürdigt',
  'evidence.tbl1.cols': [{ label: 'Phase' }, { label: 'CSAT' }],
  'evidence.tbl1.rows': [
    ['Akquise', '82'],
    ['Aktivierung', '79.7'],
    ['Engagement', '82'],
    ['Abschluss', bad('55.5')],
    ['Vermittlung', bad('51.5')],
  ],
  'evidence.tbl2.cols': [{ label: 'Segment' }, { label: 'NPS' }],
  'evidence.tbl2.rows': [
    ['Lernende, 0–3 Monate', '35'],
    ['Lernende, 4–7 Monate', '32'],
    ['Absolvierende, vermittelt', '14'],
    ['Absolvierende, nicht vermittelt', bad('−18')],
  ],
  'evidence.tbl3.cols': [{ label: 'Kennzahl' }, { label: 'Ausgangswert' }, { label: 'Ziel' }],
  'evidence.tbl3.rows': [
    ['Stelle live → Profil an ein Unternehmen weitergegeben', bad('60+ Std.'), '16 Arbeitsstd.'],
    ['Bewerbungsquote bei relevanten Stellen', '46%', '70%'],
    ['Rückzüge während des Bewerbungsprozesses', bad('29.6%'), '<10 %'],
    ['Shortlisting-Quote bei weitergegebenen Profilen', '25%', '40%'],
    ['Berechtigte unter den Interessierten', '80%', '89%'],
    ['Relevante Stellen pro Lernendem und Woche', '3', '5'],
  ],

  // ---------------------------------------------------------------- 03 Reframing
  'reframing.eyebrow': 'Neurahmung',
  'reframing.category': 'Problemrahmung · Systemdesign · Scope-Strategie',
  'reframing.questions': ['Warum ein System bauen, wenn eine Seite gewünscht war?'],
  'reframing.artifacts': 'ECAT-Rahmen · gemeinsames Status-Vokabular · gestufter Lieferplan',
  'reframing.heading': 'Von einer Vermittlungsseite zu einem System',
  'reframing.st1':
    'Gewünscht war eine Seite. Die Belege beschrieben einen Prozess ohne sichtbaren Zustand – deshalb habe ich für ein System plädiert.',
  'reframing.p1':
    'Der Unterschied ist nicht akademisch. Eine einzelne Seite konnte einen Moment im Prozess zeigen. Dieses Problem brauchte gemeinsame Regeln für jeden bedeutsamen Zustand: wer ihn ändert und was die Lernenden verstehen sollen, wenn er sich ändert.',
  'reframing.p2': 'Der Rahmen, nach dem das Team arbeitete',
  'reframing.p3': (
    <>
      Früh haben wir uns auf eine Definition geeinigt, die das ganze Projekt über trug. Das Problem der Lernenden fassten wir in vier
      Bedürfnissen zusammen:{' '}
      <strong>Berechtigung, Kommunikation, Zugang und Nachverfolgung – im Englischen Eligibility, Communication, Access und Tracking, kurz ECAT.</strong>{' '}
      Jede spätere Diskussion über den Umfang wurde in diesen Begriffen geführt – ein wesentlicher Grund, warum ein Release in drei Monaten nicht
      in einem Backlog zerfiel.
    </>
  ),
  'reframing.tbl1.cols': [{ label: 'ECAT' }, { label: 'Was die Lernenden brauchten' }, { label: 'Was daraus wurde' }],
  'reframing.tbl1.rows': [
    [
      <strong key="e">Berechtigung (Eligibility)</strong>,
      'Wissen, ob sie sich qualifizieren – und was zu tun ist, wenn nicht',
      'Banner auf der Kursseite, Kriterien-Screen, umsetzbare Hürde',
    ],
    [<strong key="c">Kommunikation (Communication)</strong>, 'Erfahren, wenn sich etwas ändert', 'Updates-Feed und Benachrichtigungssystem'],
    [
      <strong key="a">Zugang (Access)</strong>,
      'Stellen sehen, die wirklich für sie gedacht sind',
      'Gruppierung nach Relevanz, Filter, Matchmaking-Modell',
    ],
    [
      <strong key="t">Nachverfolgung (Tracking)</strong>,
      'Wissen, wo eine Bewerbung steht – und warum',
      'Meine Bewerbungen, Status-Leiter, Begründung bei Absagen',
    ],
  ],
  'reframing.p4': '1. Berechtigung verständlich und umsetzbar machen, nicht nur durchsetzen',
  'reframing.p5':
    'Lernende qualifizieren sich über den gewichteten Kursabschluss, die Teilnahme am Review-Tag und ein vollständiges Profil. Das Unternehmen musste diese Linie halten. Die Forschung zeigte: Am meisten frustrierte nicht, nicht berechtigt zu sein – sondern nicht zu wissen, warum, und nicht zu wissen, was man dagegen tun kann.',
  'reframing.tbl2.cols': [{ label: 'Geschäftsbedarf' }, { label: 'Bedarf der Lernenden' }, { label: 'Designantwort' }],
  'reframing.tbl2.rows': [
    [
      'Qualifikationsstandards halten',
      'Verstehen, warum sie nicht berechtigt sind und wie sie es werden können',
      'Kriterien, aktuelle Lücke und einen umsetzbaren Weg zur Behebung zeigen',
    ],
  ],
  'reframing.p6': (
    <>
      Mein Argument war nicht, dass die Hürde niedriger sein sollte. Es war: <strong>Eine Hürde, die die Lernenden nicht sehen können, erzeugt
      die Beschwerde.</strong>
    </>
  ),
  'reframing.p7': '2. Ein gemeinsames Status-Vokabular und Datendefinitionen entwerfen',
  'reframing.p8':
    'Das Unternehmen wusste, dass es langfristig drei Produkte brauchen würde: ein Lernendenportal, ein internes Tool für den Betrieb und etwas für Hiring-Partner. Definitionen, die eng auf das erste zugeschnitten sind, würden zu Einschränkungen für die beiden anderen. Deshalb wurden Berechtigung, Relevanz, Vermittlungsstatus und Bewerbungsstatus als Systemdefinitionen festgelegt und nicht als Screen-Verhalten – wiederverwendbar, nicht bloß ausreichend.',
  'reframing.p9': '3. Die Lösung staffeln – und einen Teil bewusst nicht bauen',
  'reframing.p10':
    'Das Lernendenportal liefern, weil die Lernenden die einzigen waren, die überhaupt keine Sicht hatten. Retool für den Betrieb anpassen statt es zu ersetzen, weil ein Release in drei Monaten, das auch noch einen Toolwechsel im Betriebsteam verlangt hätte, am Betrieb gescheitert wäre. Und bewusst kein Portal für Hiring-Partner bauen.',
  'reframing.p11':
    'Das Letzte war ein Befund, keine Kürzung. Jeder Hiring-Partner hatte einen eigenen Auswahlprozess und eine eigene Art, Kandidaten auszuwählen, und keiner wollte das Portal eines Dritten nutzen, um unsere Lernenden zu bewerten. Es zu bauen hätte bedeutet, für Menschen zu bauen, die gesagt hatten, dass sie es nicht nutzen würden. Bewerbungen gingen weiter per E-Mail raus, in dem Format, in dem die Partner ohnehin arbeiteten – während die strukturierten Datensätze dahinter so entworfen wurden, dass später ein Partnerprodukt darauf aufsetzen kann, ohne etwas neu zu modellieren.',
  'reframing.peek1.label': 'Was das Betriebstool konnte – und was nicht',
  'reframing.p12': (
    <>
      Retool ist nach Unternehmen und nach Stelle organisiert. Lernende existieren darin nur als Bewerbungszeile unter einer Stelle – es gab also
      keine Ansicht, die die Frage <em>„Wie läuft es bei dieser Person insgesamt?“</em> beantwortet, genau die Sichtbarkeit, nach der eines
      unserer eigenen Ziele verlangte.
    </>
  ),
  'reframing.p13':
    'Diese Lücke ist das stärkste Argument für das interne Tool, das ohnehin folgen sollte, und sie ist das Erste, was ich darin abbilden würde.',
  'reframing.ph1': 'Entscheidungsrahmen oder Workshop, der Lernenden-, Geschäfts- und Betriebsrestriktionen zeigt',

  // ---------------------------------------------------------------- 04 Leadership
  'leadership.eyebrow': 'Führung',
  'leadership.category': 'Design-Management · Coaching · Abstimmung mit Stakeholdern',
  'leadership.questions': ['Was haben Sie getan, und was hat Ihre Designerin bzw. Ihr Designer getan?'],
  'leadership.artifacts': 'Review-Rhythmus · Entscheidungsprinzipien · Aufteilung der Verantwortung',
  'leadership.heading': 'Wie ich die Arbeit geführt habe',
  'leadership.p1':
    'Sanya verantwortete das detaillierte Produktdesign. Es war ihr erstes großes Projekt im Unternehmen, und die Flows, Screens, Zustände und die Dokumentation stammen von ihr – so gründlich, dass sich das gesamte Produkt noch Jahre später daraus nachvollziehen lässt. Sie berichtete an mich.',
  'leadership.tbl1.cols': [
    { label: 'Meine Rolle – Manik, Product Design Manager' },
    { label: 'Product Designer – Sanya' },
    { label: 'Product Manager und Betrieb' },
  ],
  'leadership.tbl1.rows': [
    [
      'Problemrahmung, Entscheidungsprinzipien, Systemdenken, Designrichtung, Beratung zum Design-System, Abstimmung mit Stakeholdern, Qualitäts-Reviews und Übergabestrategie',
      'Flows der Lernenden, Interaktions- und Visual Design, Umsetzung der Zustände, detaillierte Dokumentation, Komponenten und Engineering-Übergabe',
      'Umfang, Geschäftsziele, Roadmap-Entscheidungen, operative Machbarkeit und Umsetzungsrestriktionen',
    ],
  ],
  'leadership.p2': 'Das Coaching, das die Arbeit verändert hat',
  'leadership.q1':
    'Die frühe Arbeit behandelte die Vermittlungserfahrung als Abfolge von Screens. In Reviews habe ich eine Frage zum Zustandsmodell eingeführt: „Was muss über diese lernende Person wahr sein, damit dieser Screen erscheint – und was muss sie verstehen oder als Nächstes tun?“ Damit verschob sich die Arbeit vom Seitendesign zu expliziten Systemzuständen und brachte wiederverwendbare Definitionen für Berechtigung, Vermittlungsstatus, Relevanz und Bewerbungsstatus hervor.',
  'leadership.p3':
    'Diese Frage war ein zentraler Führungsbeitrag zum Projekt. Sie machte aus einer wachsenden Sammlung von Screens eine begrenzte Menge von Bedingungen und gab Sanya eine Methode an die Hand, die sie später eigenständig anwenden konnte.',
  'leadership.p4': (
    <>
      Es war Sanyas erstes systemlastiges Projekt von Anfang bis Ende. Zum Abschluss konnte sie{' '}
      <strong>komplexe Produktzustände eigenständig modellieren</strong> – eine Fähigkeit, die dem Team über dieses Release hinaus erhalten blieb.
    </>
  ),
  'leadership.p5': 'Wo die Balance gehalten wurde',
  'leadership.p6':
    'In regelmäßigen Design-Reviews haben wir Entscheidungen an den Erkenntnissen über die Lernenden geprüft, Fragen zum Zustandsmodell geklärt und dafür gesorgt, dass sich die Engineering-Übergabe am System orientiert und nicht an einzelnen Screens.',
  'leadership.p7':
    'Das Design war im Raum, um die Lernenden zu vertreten, das Product Management, um das Geschäft zu vertreten. Die produktive Form davon ist kein Patt, sondern dass beide Seiten zeigen müssen, warum eine Entscheidung aus dem folgt, was Lernende tatsächlich getan haben. Meine Eingriffe waren fast immer derselbe Zug: eine Entscheidung, die aus dem Bauch getroffen wurde, zurück zu den Belegen schicken.',
  'leadership.p8':
    'Eines habe ich vertreten und nicht durchgesetzt: einen wirklich personalisierten Feed, der Stellen nach Passung und Verhalten einordnet, statt sie nach Regeln zu filtern. Er hätte eine umfangreiche Reihe von Variablen pro Lernendem erfordert, die von Tag eins an erfasst werden – und man einigte sich darauf, dass das für den ersten Umfang zu viel war. Für ein Release in drei Monaten war das eine vernünftige Entscheidung, und ich würde sie aus der Sicht des Product Managers genauso treffen.',
  'leadership.ph1': 'Beispiel für ein Design-Review oder eine Kritik, in dem die Frage zum Zustandsmodell auf echte Arbeit angewendet wird',

  // ---------------------------------------------------------------- 05 The product
  'product.eyebrow': 'Das Produkt',
  'product.category': 'Interaktionsdesign · Content Design · Zustandsmodellierung',
  'product.questions': ['Was haben Lernende tatsächlich gesehen – und warum genau das?'],
  'product.artifacts': 'Dynamisches Banner · Interesse und Berechtigung · Jobs und Nachverfolgung · drei Enden',
  'product.heading': 'Zustand und nächste Schritte sichtbar machen',
  'product.st1': 'Jede Oberfläche beantwortete zwei Fragen: Wo stehe ich, und was passiert als Nächstes?',
  'product.note1.label': 'Interaktiver Prototyp',
  'product.p1': (
    <>
      Der funktionierende Prototyp ist oben auf dieser Seite live, und alles aus den vier Momenten unten steckt darin. Scrollen und klicken Sie
      im Frame, oder <a href="#prototype">springen Sie zurück nach oben</a>.
    </>
  ),
  'product.p2': 'Vier Momente',
  'product.p3': (
    <>
      <strong>1. Das Banner auf der Kursseite.</strong> Das Portal hat keine Eingangstür. Lernende erreichen es über ein einziges Banner auf
      ihrer Kursseite, das sich je nach Stand anders auflöst – Berechtigung prüfen, Interessenformular ausfüllen, Abschluss geschafft,
      Countdown bis zur Freischaltung, freigeschaltet, nicht berechtigt, „Sie haben angegeben, nicht interessiert zu sein“. Es war die erste
      Komponente, die spezifiziert wurde, denn nur sie stellt sicher, dass das Produkt die Lernenden dort abholt, wo sie gerade stehen.
    </>
  ),
  'product.ph1': 'Dynamisches Banner in den wichtigsten Zuständen',
  'product.p4': (
    <>
      <strong>2. Berechtigung und Interesse.</strong> Kriterien vollständig gezeigt, die aktuelle Lücke der Lernenden benannt und auf jedem
      Screen, der Nein sagt, ein Weg, sie zu schließen. Das Interessenformular ersetzte das Google-Formular – mit Gehaltsvorstellung,
      Kündigungsfrist, Wunschort, Umzugsbereitschaft, Spezialisierung und ausdrücklicher Einwilligung, das Profil an Hiring-Partner weiterzugeben,
      dazu ein Hinweis in einfacher Sprache, dass das Ausfüllen keine Stelle garantiert.
    </>
  ),
  'product.p5': (
    <>
      <strong>3. Relevante Möglichkeiten.</strong> Stellen nach Relevanz gruppiert, mit Anzahl – so sehen Lernende, wie viel der Jobbörse
      wirklich für sie gedacht ist. Der Standort ist ein <em>weiches</em> Kriterium: Eine Stelle außerhalb des genannten Wunsches wird weder
      versteckt noch blockiert – die Lernenden werden informiert und entscheiden selbst. Bei <Num to={14} /> dokumentierten Fällen, in denen
      Lernende Angebote annahmen und dann wegen des Standorts absagten, wäre es die einfache und falsche Antwort gewesen, diese Stellen
      auszublenden.
    </>
  ),
  'product.p6': (
    <>
      <strong>4. Nachverfolgung und ein Ende.</strong> Begründungen wandern in jeder Phase mit der Bewerbung mit – ein nicht weitergegebenes
      Profil sagt, warum, eine Absage nennt den genannten Grund. Und die Reise hat einen gestalteten Abschluss, wie auch immer sie ausgeht.
    </>
  ),
  'product.seq1': [
    {
      alt: 'Die Jobbörse: Tabs für „All Jobs“, „Featured“, „Relevant“ mit Anzahl und „Expired“, darunter Job-Karten mit Unternehmen, Rolle, Prüfung von Abschluss und Erfahrung, Standort und verbleibender Bewerbungszeit.',
      label: 'Eine Stelle finden',
      caption:
        'Stellen sind nach Relevanz mit Anzahl gruppiert, und jede Karte zeigt die Prüfung von Abschluss und Erfahrung, den Standort und die verbleibende Bewerbungszeit.',
    },
    {
      alt: 'Eine Stellenbeschreibung: Unternehmen und Rolle, die Übereinstimmung von Abschluss und Erfahrung der Lernenden, ein Fristen-Banner mit dem Button „Apply Now“, darunter „About the Job“ und „Role Accountabilities“.',
      label: 'Passung prüfen, dann bewerben',
      caption: 'Zuerst der Abgleich mit den Anforderungen, dann eine klare nächste Handlung.',
    },
    {
      alt: 'Bewerbungs-Tracker mit dem Titel „Your Journey with AECOM Architects“: „Applied“, „Profile Shared“ und „Profile Shortlisted“ sind erreicht, „Selected for interview“, „Offer Received“ und „Offer Accepted“ stehen noch aus.',
      label: 'Der Bewerbung folgen',
      caption: 'Jede erreichte Phase einer Bewerbung ist markiert, und was als Nächstes kommt, bleibt sichtbar.',
    },
    {
      alt: 'Bestätigung nach der Annahme eines Angebots: eine Illustration, die Meldung „Congratulations, you’ve accepted the offer from AECOM Architects“ und ein Fünf-Sterne-Element „Rate Experience“.',
      label: 'Das Angebot annehmen',
      caption: 'Annehmen, bestätigen, feiern – dann die Erfahrung bewerten.',
    },
  ],
  'product.p7': 'Drei Enden',
  'product.p8': (
    <>
      <strong>Vermittelt.</strong> Annehmen, bestätigen, feiern, dann die Erfahrung bewerten und die Geschichte teilen. Danach schränkt das
      Produkt den Zugang zum Rest bewusst ein, denn wer vermittelt ist, braucht keine Stellenangebote mehr.
    </>
  ),
  'product.p9': (
    <>
      <strong>Eigenvermittelt.</strong> „Teilen Sie Ihre Jobneuigkeiten mit uns“ – Unternehmen, Position, Standort. Klein gehalten und gezielt
      auf die <Num to={30} suffix="%" /> der Ergebnisse ausgerichtet, die bisher für das Unternehmen unsichtbar waren und für die Lernenden
      unbeachtet blieben.
    </>
  ),
  'product.p10': (
    <>
      <strong>Nicht vermittelt.</strong> Wenn das Zeitfenster ohne Vermittlung endet, werden die Lernenden weder ausgeloggt noch stillschweigend
      ausgetragen. Sie bekommen eine Seite, die sagt, dass die Suche zu Ende geht, die die Schwierigkeit anerkennt, ihnen sagt, dass ihr Einsatz
      zählte, und fragt, was besser hätte laufen können.
    </>
  ),
  'product.p11': (
    <>
      Eine Regel in diesem Ende verdient es, für sich genannt zu werden, denn sie war die menschlichste Entscheidung des Projekts und existiert nur
      als Notiz auf dem Übergabe-Board: <strong>Lernende können den Zugang zum Portal nicht verlieren, solange sie mitten im Prozess sind.</strong>{' '}
      Das Ende des Zeitfensters war nie absolut.
    </>
  ),
  'product.gal1': [
    {
      alt: 'Bestätigung nach der Annahme eines Angebots: eine Illustration, die Meldung „Congratulations, you’ve accepted the offer from AECOM Architects“ und ein Fünf-Sterne-Element „Rate Experience“.',
      caption: 'Vermittelt. Annehmen, bestätigen, feiern, dann die Erfahrung bewerten.',
    },
    {
      alt: 'Eine Karte mit dem Text „Got placed with your own hard work?“ und dem Link „Share your triumphs with us“ über einer festlichen Illustration.',
      caption: 'Eigenvermittelt. „Got placed with your own hard work?“ lädt die Lernenden ein, ihre Neuigkeiten zu teilen.',
    },
    {
      placeholder: 'Nicht vermittelt – die Seite zum Ende des Zeitfensters',
      caption: 'Nicht vermittelt. Die Suche geht zu Ende, und die Lernenden werden gefragt, was besser hätte laufen können.',
    },
  ],
  'product.p12': 'Das System darunter',
  'product.p13':
    'Die sichtbare Erfahrung stützte sich auf ein definiertes Zustandsmodell. Der komplexeste Screen löste mehrere unabhängige Bedingungen auf – Relevanz, Berechtigung und Bewerbungsstatus –, sodass das Engineering Regeln und Kombinationen erhielt statt isolierter Screenshots.',
  'product.peek1.label': 'Das Zustandsmodell im Ganzen',
  'product.peek1.more': 'Alle sechs Eingaben anzeigen',
  'product.p14': 'Was Lernende sehen sollten, ergab sich aus sechs Eingaben:',
  'product.li1': (
    <>
      <strong>Etappe der Reise</strong> – wo sie im Kurs stehen, vom Lernmodus bis zum Abschluss
    </>
  ),
  'product.li2': (
    <>
      <strong>Berechtigung</strong> – noch nicht geprüft, berechtigt oder nicht berechtigt
    </>
  ),
  'product.li3': (
    <>
      <strong>Vollständigkeit des Profils</strong> – Lebenslauf und Portfolio hochgeladen oder nicht
    </>
  ),
  'product.li4': (
    <>
      <strong>Vermittlungsstatus</strong> – die Gesamtlage der Lernenden, unter anderem vermittelt, eigenvermittelt, abgesagt und
      ausgeschlossen
    </>
  ),
  'product.li5': (
    <>
      <strong>Status je Bewerbung</strong> – von beworben bis vermittelt, mit jeweils definiertem Austrittsgrund
    </>
  ),
  'product.li6': (
    <>
      <strong>Verfügbarkeit und Relevanz von Stellen</strong> – ob es Stellen gibt und ob welche für diese Lernenden relevant sind
    </>
  ),
  'product.p15':
    'Jede wurde als Definition festgelegt und nicht als Screen-Verhalten, sodass dasselbe Vokabular in das Betriebstool und später in ein Partnerprodukt übergehen konnte.',
  'product.seq2': [
    {
      alt: 'Job-Screen für eine relevante Stelle: Abschluss und Erfahrung stimmen überein, ein grünes Banner zählt die Frist herunter, dazu der Button „Apply Now“.',
      label: 'Relevant, Bewerbung möglich',
      caption: 'Berechtigung erfüllt und eine Frist, die herunterzählt.',
    },
    {
      alt: 'Job-Screen für eine nicht passende Stelle: Der Abschluss ist als nicht passend markiert, und ein Button „Share concern“ ersetzt „Apply Now“.',
      label: 'Kein Match',
      caption: 'Die nicht erfüllte Anforderung ist markiert, und die Lernenden können Bedenken äußern.',
    },
    {
      alt: 'Job-Screen für eine abgelaufene Stelle: ein Banner „No longer accepting applications“ und ein deaktivierter Button „Apply Now“.',
      label: 'Abgelaufen',
      caption: 'Bewerbungen sind geschlossen, und die Aktion ist deaktiviert.',
    },
    {
      alt: 'Job-Screen für eine laufende Bewerbung: ein Status-Badge „In Process“ und eine Meldung, dass die Bewerbung geprüft wird.',
      label: 'Beworben, in Bearbeitung',
      caption: 'Der Status wird benannt, und statt der Bewerbungsaktion steht da, was gerade passiert.',
    },
  ],
  'product.p16':
    'Eine strukturelle Folge ist erwähnenswert. Der Screen mit der Stellenbeschreibung übernahm am Ende zwei unabhängige Aufgaben – eine Stelle bewerten, auf die man sich noch nicht beworben hat, und eine laufende Bewerbung nachverfolgen. Er ging live und funktionierte, aber diese beiden Aufgaben auf zwei Oberflächen aufzuteilen, wäre heute die erste Änderung, die ich vornehmen würde.',

  // ---------------------------------------------------------------- 06 Handover
  'handover.eyebrow': 'Übergabe',
  'handover.category': 'Design-Systeme · Dokumentation · Engineering-Übergabe',
  'handover.questions': ['Wie kam das ins Engineering, ohne seine Logik zu verlieren?'],
  'handover.artifacts': '63 annotierte Zustände · ~45 Komponenten · Mobile-Bibliothek · Journey- und State-Boards',
  'handover.heading': 'Spezifiziert, um gebaut zu werden – und um darauf weiterzubauen',
  'handover.p1':
    'Die Übergabe richtete sich an zwei Zielgruppen: die Engineers, die es damals bauten, und alle, die später das nächste Produkt darauf aufsetzen würden.',
  'handover.p2': (
    <>
      <Num to={63} /> Screen-Zustände, jeweils mit der Bedingung annotiert, die sie auslöst. Rund <Num to={45} /> Komponenten mit
      Entwicklerhinweisen. <Num to={5} /> Journey-Boards, die den Ablauf den Screens zuordnen – vom Lernmodus bis zum Abschluss –,{' '}
      <Num to={6} /> State-Boards, die jede Oberfläche abdecken, und ein vollständiges paralleles Mobile-Set mit eigener Komponentenbibliothek –
      alles auf Basis des bestehenden LMS-Design-Systems von Novatr statt eines neuen.
    </>
  ),
  'handover.p3':
    'Über dieses Release hinaus zählte vor allem das Vokabular. Die Status-Leiter, die Relevanzkriterien und das Berechtigungsmodell wurden als Systemdefinitionen übergeben und nicht als Screen-Verhalten, sodass das Betriebstool und jedes künftige Partnerprodukt sie übernehmen konnten, statt konkurrierende Versionen zu erfinden.',
  'handover.stats1': [
    { label: 'annotierte Screen-Zustände' },
    { label: 'Komponenten mit Entwicklerhinweisen' },
    { label: 'Journey-Boards' },
    { label: 'State-Boards' },
  ],
  'handover.peek1.label': 'Was in der Übergabe enthalten war',
  'handover.li1': (
    <>
      <strong>63</strong> annotierte Screen-Zustände
    </>
  ),
  'handover.li2': (
    <>
      <strong>~45</strong> Komponenten mit Entwicklerhinweisen
    </>
  ),
  'handover.li3': (
    <>
      <strong>5</strong> Journey-Boards, Ablauf den Screens zugeordnet
    </>
  ),
  'handover.li4': (
    <>
      <strong>6</strong> State-Boards – Startseite, Jobs, Bewerbungen, Stellenbeschreibungen, Pop-ups, Updates
    </>
  ),
  'handover.li5': 'Vollständiges paralleles Mobile-Set und Komponentenbibliothek',
  'handover.li6': 'Aus dem bestehenden LMS-Design-System erweitert',
  'handover.ph1': 'Annotiertes Übergabe-Board in voller Übersicht und die Komponentenbibliothek mit Entwicklerhinweisen',

  // ---------------------------------------------------------------- 07 Launch and measurement
  'launch.eyebrow': 'Launch und Messung',
  'launch.category': 'Messkonzept · Ergebnisanalyse · Retrospektive',
  'launch.questions': ['Hat es funktioniert, und was würden Sie anders machen?'],
  'launch.artifacts': 'Ausgangs- und Ergebnisset · Grenzen der Zuordnung · Änderungsliste',
  'launch.heading': 'Was live ging, was wir gemessen haben und was ich ändern würde',
  'launch.p1':
    'Das Portal ging für die Absolvierenden-Kohorten live, und die Zufriedenheit in der Vermittlungsphase wurde danach fortlaufend mit denselben Instrumenten gemessen, die auch die Ausgangswerte geliefert hatten – Vorher und Nachher sind also direkt vergleichbar.',
  'launch.tbl1.cols': [{ label: 'Kennzahl' }, { label: 'Ausgangswert' }, { label: 'Danach*' }, { label: 'Beabsichtigte Wirkung' }],
  'launch.tbl1.rows': [
    ['CSAT in der Vermittlungsphase', bad('51.5'), good('68.2'), 'Klare Sichtbarkeit von Status, Berechtigung und nächsten Schritten'],
    ['NPS, vermittelte Absolvierende', '14', good('31'), 'Besserer Abschluss, mehr Zuversicht und Anerkennung'],
    ['NPS, nicht vermittelte Absolvierende', bad('−18'), good('−3'), 'Ein anerkennender, informativer Abschluss statt Schweigen'],
    ['Von der Freigabe bis zur Profilweitergabe', bad('60+ Stunden'), good('14,5 Arbeitsstunden'), 'Strukturierte Datensätze und ein klarerer operativer Workflow'],
    ['Bewerbungsquote bei relevanten Stellen', '46%', good('66%'), 'Gruppierung nach Relevanz, klarere Fristen und sichtbare Status'],
    ['Rückzüge während des Bewerbungsprozesses', bad('29.6%'), good('13.2%'), 'Bessere Erwartungssteuerung und sichtbare Konsequenzen'],
    ['Shortlisting-Quote bei weitergegebenen Profilen', '25%', good('37%'), 'Bessere Vorbereitung und Relevanzprüfungen'],
    ['Berechtigte unter den Interessierten', '80%', good('87%'), 'Umsetzbare Berechtigungskriterien und Hinweise zur Vorbereitung'],
  ],
  'launch.note1.label': '*Platzhalter/illustrative Zahlen · Entwurfshinweis',
  'launch.p2':
    'Alle Zahlen nach dem Launch oben sind für diesen Entwurf illustrative Platzhalter. Vor der Veröffentlichung sind sie durch geprüfte Ergebnisse, Daten, Kohortengröße, Stichprobengröße der Umfrage und Messmethodik zu ersetzen.',
  'launch.p3': (
    <>
      Eine Behauptung stellt diese Fallstudie nicht auf: <strong>dass das Portal die Zahl der verfügbaren Jobs erhöht hat.</strong>
    </>
  ),
  'launch.q1':
    'Das Portal hat das Stellenangebot sichtbar und Lücken messbar gemacht; das Angebot an relevanten Stellen zu vergrößern blieb Aufgabe des Betriebs und der Partnerschaften.',
  'launch.ph1': 'Messung nach dem Launch – CSAT- oder NPS-Reporting oder das Dashboard, mit dem das Vermittlungsteam arbeitete',
  'launch.p4': 'Was ich ändern würde',
  'launch.li1': (
    <>
      <strong>Die Bewertung von Stellen von der Nachverfolgung laufender Bewerbungen trennen.</strong> Zwei Oberflächen, zwei Aufgaben, deutlich
      weniger Bedingungen auf jeder.
    </>
  ),
  'launch.li2': (
    <>
      <strong>Die Regeln zum schrittweisen Ausschluss und zur sofortigen ungültigen Absage vereinheitlichen.</strong> Ein Konsequenzmodell, von
      Anfang an klar benannt, damit Lernende immer wissen, welche Regeln für sie gelten.
    </>
  ),
  'launch.li3': (
    <>
      <strong>Einen Kriterienkatalog für menschliche Entscheidungen schaffen, die den Zugang der Lernenden zu einem bezahlten Angebot berühren.</strong>{' '}
      Urteile mit solchem Gewicht sollten nicht auf der Einschätzung einer einzelnen Person ohne Kriterien oder Präzedenzfälle beruhen.
    </>
  ),
  'launch.li4': (
    <>
      <strong>Erklären, warum eine Stelle nicht als relevant gilt – nicht nur, dass sie es nicht ist.</strong> Begründungen wandern mit einer
      Bewerbung mit, sobald sie läuft; sie sollten es auch schon vorher tun.
    </>
  ),
  'launch.li5': (
    <>
      <strong>Leere oder nicht unterstützte Navigationszustände entfernen.</strong> Wir haben einen Bereich ausgeliefert, in dem nie Inhalt war.
    </>
  ),
  'launch.li6': (
    <>
      <strong>Primärinterviews mit nicht vermittelten Absolvierenden an den Anfang des Projekts stellen.</strong> Diese Gruppe beantwortete
      Umfragen nur halb so oft wie die aktuellen Lernenden – gerade die Menschen, von denen wir am dringendsten hören mussten, waren in unseren
      Daten am schwächsten vertreten.
    </>
  ),
  'launch.p5': 'Reflexion',
  'launch.q2':
    'Das wichtigste Ergebnis war nicht allein ein Portal. Es war eine gemeinsame Sprache für einen Vermittlungsprozess, der zuvor als Sammlung unverbundener menschlicher Handlungen existierte. Dieses Fundament machte die Erfahrung der Lernenden sofort klarer und erleichtert es, künftige Betriebs-, Partner- und Personalisierungsprodukte verantwortungsvoll zu bauen.',
  'launch.p6': (
    <>
      <b>Placement Hub · Novatr</b>
      <br />
      Design Leadership: Manik Madaan · Product Design: Sanya · Product Management: Swati
    </>
  ),

  // ---------------------------------------------------------------- the 2-minute story
  'story.problem.kicker': 'Das Problem',
  'story.problem.title': 'Die Vermittlungsunterstützung war unsichtbar.',
  'story.problem.body':
    'Lernende hatten Unterstützung bei der Jobvermittlung gebucht. Erlebt haben sie einen Slack-Kanal, einen E-Mail-Verlauf und ein Google-Formular – und danach wurde es still um den Prozess.',
  'story.problem.label': 'Was Lernende nicht sehen konnten',
  'story.problem.rows': ['Ob eine Stelle zu ihnen passte', 'Ob ihr Profil weitergegeben wurde', 'Wo ihre Bewerbung stand', 'Warum sie nicht berechtigt waren', 'Was als Nächstes zu tun war'],
  'story.problem.footer': '„Nachrichten gehen in Slack unter.“',
  'story.evidence.kicker': 'Belege',
  'story.evidence.title': 'Die Zufriedenheit brach genau dort ein, wo das Versprechen fällig wurde.',
  'story.evidence.body':
    'Sie blieb während des Lernens stabil und sank dann in der Vermittlungsphase. Der Net Promoter Score erzählte dieselbe Geschichte – er sank, je weiter man auf der Reise kam.',
  'story.evidence.label': 'Zufriedenheit (CSAT) nach Phase',
  'story.evidence.rows': [['Akquise', 82], ['Aktivierung', 79.7], ['Engagement', 82], ['Abschluss', 55.5, true], ['Vermittlung', 51.5, true]],
  'story.evidence.callout': 'NPS bei Absolvierenden, die nicht vermittelt wurden:',
  'story.reframing.kicker': 'Neurahmung',
  'story.reframing.title': 'Gewünscht war eine Seite. Die Belege beschrieben ein System.',
  'story.reframing.body':
    'Eine Seite zeigt einen Moment. Das Problem brauchte gemeinsame Regeln für jeden Zustand: wer ihn ändert und was Lernende verstehen sollen, wenn er sich ändert.',
  'story.reframing.text': 'der Vermittlungen waren Eigenvermittlungen – für das Unternehmen unsichtbar und vom Produkt nicht gewürdigt',
  'story.reframing.pillsLabel': 'Der Rahmen, nach dem wir arbeiteten: ECAT',
  'story.reframing.pills': ['Berechtigung (Eligibility)', 'Kommunikation (Communication)', 'Zugang (Access)', 'Nachverfolgung (Tracking)'],
  'story.leadership.kicker': 'Führung',
  'story.leadership.title': 'Eine Frage veränderte, wie gearbeitet wurde.',
  'story.leadership.body':
    'Sanya verantwortete das detaillierte Design; ich Rahmung, Prinzipien und Reviews. Diese Frage in jedem Review verwandelte einen Stapel Screens in eine überschaubare Menge von Zuständen.',
  'story.leadership.quote': '„Was muss über diese lernende Person wahr sein, damit dieser Screen erscheint – und was muss sie verstehen oder als Nächstes tun?“',
  'story.leadership.caption': 'Screens → explizite Zustände → gemeinsame Definitionen',
  'story.product.kicker': 'Das Produkt',
  'story.product.title': 'Jeder Screen beantwortet: Wo stehe ich, und was kommt als Nächstes?',
  'story.product.body':
    'Derselbe Job-Screen löst sich je nach Person anders auf – die nicht erfüllte Anforderung wird benannt, die Frist läuft sichtbar, die nächste Handlung ist immer klar.',
  'story.product.states': [
    { label: 'Relevant, Bewerbung möglich', alt: 'Job-Screen für eine passende Stelle mit dem Button „Apply Now“.' },
    { label: 'Kein Match', alt: 'Job-Screen für eine nicht passende Stelle mit dem Button „Share concern“.' },
    { label: 'Abgelaufen', alt: 'Job-Screen für eine abgelaufene Stelle mit deaktiviertem Button „Apply Now“.' },
    { label: 'Beworben, in Bearbeitung', alt: 'Job-Screen für eine Bewerbung in Bearbeitung.' },
  ],
  'story.handover.kicker': 'Übergabe',
  'story.handover.title': 'Spezifiziert, um gebaut zu werden – und um darauf weiterzubauen.',
  'story.handover.body':
    'Status, Relevanz und Berechtigung wurden als Systemdefinitionen übergeben, damit das Betriebstool und jedes künftige Partnerprodukt sie übernehmen können, statt eigene zu erfinden.',
  'story.handover.stats': [
    { label: 'annotierte Screen-Zustände' },
    { label: 'Komponenten mit Entwicklerhinweisen' },
    { label: 'Journey-Boards' },
    { label: 'State-Boards' },
  ],
  'story.launch.kicker': 'Launch und Messung',
  'story.launch.title': 'Was live ging und was wir gemessen haben.',
  'story.launch.body':
    'Gemessen mit denselben Instrumenten wie die Ausgangswerte. Eine Behauptung stellt diese Fallstudie nicht auf: dass das Portal mehr Jobs geschaffen hat.',
  'story.launch.rows': [
    ['CSAT in der Vermittlungsphase', '51,5', '68,2'],
    ['NPS, nicht vermittelte Absolvierende', '−18', '−3'],
    ['Rückzüge im Bewerbungsprozess', '29,6 %', '13,2 %'],
  ],
  'story.launch.footnote': '*Illustrative Zahlen in diesem Entwurf – durch geprüfte Ergebnisse zu ersetzen',
};
