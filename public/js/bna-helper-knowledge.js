(function () {
  'use strict';

  const whatsappUrl = 'https://wa.me/16463892499';

  const helperData = {
    en: {
      intro:
        "Hi - I'm here to help. Are you looking to sign up a child, learn how the program works, or join as a service provider?",
      choices: [
        { id: 'signup', label: 'Sign up a child' },
        { id: 'learn_bna', label: 'Learn about BNA' },
        { id: 'student', label: "I'm a student" },
        { id: 'provider', label: 'Become a service provider' },
        { id: 'self_governance', label: 'Ask about self-governance' },
        { id: 'sodas', label: 'Parenting / SODAS help' },
        { id: 'question', label: 'Ask a question' },
      ],
      nudges: {
        first: {
          body: 'Need help finding the right path?',
          actions: [{ type: 'open', label: 'Open helper' }],
        },
        second: {
          body:
            'I can help with signup, the school model, self-governance, or becoming a service provider.',
          actions: [
            { type: 'path', path: 'signup', label: 'Sign up' },
            { type: 'path', path: 'provider', label: 'Service provider' },
            { type: 'path', path: 'learn_bna', label: 'How BNA works' },
            { type: 'path', path: 'question', label: 'Ask a question' },
          ],
        },
      },
      paths: {
        signup: {
          body:
            'Bnei Neviim is for boys who need a smaller, more personal Torah learning environment. The current morning program supports homeschool and alternative Torah learning families with relationship-based Limudei Kodesh, goals, movement, and accountability. You can start with the signup form or ask a specific question.',
          actions: [
            { type: 'link', href: '/signup.html', label: 'Go to signup' },
            { type: 'link', href: whatsappUrl, label: 'WhatsApp us' },
            {
              type: 'prefill',
              label: 'Ask a question',
              prompt: 'I have a question about signing up a child: ',
            },
          ],
        },
        learn_bna: {
          body:
            'BNA is a homeschool-support Torah learning model with morning Limudei Kodesh, small-group relationship-based learning, movement, goals, accountability, and real self-governance. We are also building an evening-program and service-provider ecosystem so families can find the right mix of learning, skills, support, and structure.',
          actions: [
            { type: 'scroll', target: '#blog', label: 'Read philosophy' },
            { type: 'scroll', target: '#faq', label: 'See FAQ' },
            { type: 'link', href: '/signup.html', label: 'Sign up' },
            { type: 'path', path: 'self_governance', label: 'Ask about self-governance' },
          ],
        },
        student: {
          body:
            "I can help you think through a goal, a situation, or a learning question. You do not need to share private details here. For anything important, unsafe, or confusing, bring in a parent, rebbe, or trusted adult too.",
          actions: [
            { type: 'path', path: 'sodas', label: 'Think through a situation' },
            {
              type: 'prefill',
              label: 'Work on a goal',
              prompt: 'I want help thinking through this goal: ',
            },
            {
              type: 'prefill',
              label: 'Ask about learning',
              prompt: 'I have a question about learning: ',
            },
            {
              type: 'prefill',
              label: 'Talk to an adult',
              prompt: 'I want help explaining this to an adult: ',
            },
          ],
        },
        provider: {
          body:
            "We're building a family learning ecosystem: morning Torah learning, evening programs, parent support, and a directory of trusted service providers. Providers can start with a free profile/listing and later upgrade for marketing, funnel help, ads, SEO, or a stronger web presence. Do you want to join the provider list or just hear how it works?",
          actions: [
            {
              type: 'link',
              href: '/become-service-provider?onboard=provider',
              label: 'Join provider list',
            },
            { type: 'scroll', target: '#learning-ecosystem', label: 'Learn provider model' },
            { type: 'link', href: whatsappUrl, label: 'Contact Shloimie' },
            {
              type: 'prefill',
              label: 'Submit info',
              prompt:
                'I am interested in joining the BNA provider list. My service is: ',
            },
          ],
        },
        self_governance: {
          body:
            'Self-governance means helping a child notice what is happening inside, understand his choices, and take ownership of the next step. It is not "do whatever you want." It is freedom with structure, relationship, Torah responsibility, honest reflection, goals, consequences, awareness, and internal motivation. Do you want the parent version or the student version?',
          actions: [
            {
              type: 'message',
              label: 'Explain for parents',
              body:
                'For parents, self-governance means guiding a child toward ownership without using shame, bribery, or constant pressure as the engine. The adult still provides structure, relationship, clear expectations, and honest consequences. The goal is that the child learns to make Torah-connected choices from the inside out. What part of that do you want to apply at home?',
            },
            {
              type: 'message',
              label: 'Explain for students',
              body:
                'For students, self-governance means learning to notice what is happening, choose the next right step, and take responsibility for your learning and middos. It does not mean no rules. It means your choices matter, and you can practice making stronger ones. What choice are you working on right now?',
            },
            { type: 'scroll', target: '#blog', label: 'Read more' },
            {
              type: 'prefill',
              label: 'Ask a follow-up',
              prompt: 'My follow-up about self-governance is: ',
            },
          ],
        },
        sodas: {
          messages: [
            'We can use SODAS: Situation, Options, Disadvantages, Advantages, Solution. First we understand what happened and how it felt, then we look at choices and consequences, and only then choose a next step.',
            'Let\'s slow it down. What was the situation - what happened, and how did it make him feel?',
          ],
          actions: [
            { type: 'sodas_option', label: 'He was frustrated', feeling: 'frustrated' },
            { type: 'sodas_option', label: 'He felt embarrassed', feeling: 'embarrassed' },
            { type: 'sodas_option', label: 'He felt angry', feeling: 'angry' },
            { type: 'sodas_option', label: 'He shut down', feeling: 'shut down' },
            {
              type: 'prefill',
              label: "I'll type it",
              prompt: 'The situation was: ',
            },
          ],
        },
        question: {
          body:
            'Sure. Type your question here, and I can route it toward signup, the school model, self-governance, service providers, or parenting reflection.',
          actions: [
            {
              type: 'prefill',
              label: 'Type my question',
              prompt: '',
            },
            { type: 'path', path: 'signup', label: 'Signup' },
            { type: 'path', path: 'provider', label: 'Provider' },
            { type: 'path', path: 'sodas', label: 'SODAS' },
          ],
        },
      },
      sodas: {
        nextAfterFeeling:
          'That gives us the Situation. What choices were available in that moment?',
        optionButtons: [
          {
            type: 'prefill',
            label: 'Type the options',
            prompt: 'The choices available were: ',
          },
          {
            type: 'message',
            label: 'Give examples',
            body:
              'Some options might be: pause and breathe, ask for help, use words, take space, repair what happened, or try again. Which options fit this situation?',
          },
        ],
      },
      safety:
        'This sounds like it may involve safety or urgent harm. Please bring in a trusted adult right now, and contact local emergency support if anyone may be in danger. What adult can be with you or the child now?',
    },
    he: {
      intro:
        '\u05e9\u05dc\u05d5\u05dd - \u05d0\u05e0\u05d9 \u05db\u05d0\u05df \u05dc\u05e2\u05d6\u05d5\u05e8. \u05d0\u05ea\u05dd \u05e8\u05d5\u05e6\u05d9\u05dd \u05dc\u05e8\u05e9\u05d5\u05dd \u05d9\u05dc\u05d3, \u05dc\u05d4\u05d1\u05d9\u05df \u05d0\u05d9\u05da \u05d4\u05ea\u05d5\u05db\u05e0\u05d9\u05ea \u05e2\u05d5\u05d1\u05d3\u05ea, \u05d0\u05d5 \u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05db\u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea?',
      choices: [
        { id: 'signup', label: '\u05dc\u05e8\u05e9\u05d5\u05dd \u05d9\u05dc\u05d3' },
        {
          id: 'learn_bna',
          label:
            '\u05dc\u05d4\u05d1\u05d9\u05df \u05e2\u05dc \u05d1\u05e0\u05d9 \u05e0\u05d1\u05d9\u05d0\u05d9\u05dd',
        },
        { id: 'student', label: '\u05d0\u05e0\u05d9 \u05ea\u05dc\u05de\u05d9\u05d3' },
        {
          id: 'provider',
          label:
            '\u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05db\u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea',
        },
        {
          id: 'self_governance',
          label: '\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea',
        },
        { id: 'sodas', label: '\u05e2\u05d6\u05e8\u05d4 \u05dc\u05d4\u05d5\u05e8\u05d9\u05dd' },
        { id: 'question', label: '\u05dc\u05e9\u05d0\u05d5\u05dc \u05e9\u05d0\u05dc\u05d4' },
      ],
      nudges: {
        first: {
          body:
            '\u05e6\u05e8\u05d9\u05db\u05d9\u05dd \u05e2\u05d6\u05e8\u05d4 \u05dc\u05de\u05e6\u05d5\u05d0 \u05d0\u05ea \u05d4\u05db\u05d9\u05d5\u05d5\u05df \u05d4\u05e0\u05db\u05d5\u05df?',
          actions: [{ type: 'open', label: '\u05dc\u05e4\u05ea\u05d5\u05d7 \u05e2\u05d5\u05d6\u05e8' }],
        },
        second: {
          body:
            '\u05d0\u05e0\u05d9 \u05d9\u05db\u05d5\u05dc \u05dc\u05e2\u05d6\u05d5\u05e8 \u05e2\u05dd \u05e8\u05d9\u05e9\u05d5\u05dd, \u05de\u05d5\u05d3\u05dc \u05d4\u05dc\u05d9\u05de\u05d5\u05d3, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea \u05d0\u05d5 \u05d4\u05e6\u05d8\u05e8\u05e4\u05d5\u05ea \u05db\u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea.',
          actions: [
            { type: 'path', path: 'signup', label: '\u05e8\u05d9\u05e9\u05d5\u05dd' },
            { type: 'path', path: 'provider', label: '\u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea' },
            {
              type: 'path',
              path: 'learn_bna',
              label: '\u05d0\u05d9\u05da \u05d6\u05d4 \u05e2\u05d5\u05d1\u05d3',
            },
            { type: 'path', path: 'question', label: '\u05dc\u05e9\u05d0\u05d5\u05dc' },
          ],
        },
      },
      paths: {
        signup: {
          body:
            '\u05d1\u05e0\u05d9 \u05e0\u05d1\u05d9\u05d0\u05d9\u05dd \u05de\u05d9\u05d5\u05e2\u05d3\u05ea \u05dc\u05d1\u05e0\u05d9\u05dd \u05e9\u05e6\u05e8\u05d9\u05db\u05d9\u05dd \u05de\u05e1\u05d2\u05e8\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05ea \u05e7\u05d8\u05e0\u05d4, \u05d0\u05d9\u05e9\u05d9\u05ea \u05d5\u05de\u05d7\u05d5\u05d1\u05e8\u05ea \u05d9\u05d5\u05ea\u05e8. \u05d4\u05ea\u05d5\u05db\u05e0\u05d9\u05ea \u05d1\u05d1\u05d5\u05e7\u05e8 \u05ea\u05d5\u05de\u05db\u05ea \u05d1\u05de\u05e9\u05e4\u05d7\u05d5\u05ea \u05d4\u05d5\u05de\u05e1\u05e7\u05d5\u05dc \u05d5\u05d1\u05dc\u05d9\u05de\u05d5\u05d3 \u05ea\u05d5\u05e8\u05d4 \u05d0\u05dc\u05d8\u05e8\u05e0\u05d8\u05d9\u05d1\u05d9 \u05e2\u05dd \u05e7\u05e9\u05e8, \u05de\u05d8\u05e8\u05d5\u05ea, \u05ea\u05e0\u05d5\u05e2\u05d4 \u05d5\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea.',
          actions: [
            { type: 'link', href: '/signup-he.html', label: '\u05dc\u05d8\u05d5\u05e4\u05e1 \u05d4\u05e8\u05e9\u05de\u05d4' },
            { type: 'link', href: whatsappUrl, label: '\u05d5\u05d5\u05d0\u05d8\u05e1\u05d0\u05e4' },
            {
              type: 'prefill',
              label: '\u05dc\u05e9\u05d0\u05d5\u05dc \u05e9\u05d0\u05dc\u05d4',
              prompt: '',
            },
          ],
        },
        learn_bna: {
          body:
            '\u05d1\u05e0\u05d9 \u05e0\u05d1\u05d9\u05d0\u05d9\u05dd \u05d4\u05d9\u05d0 \u05de\u05d5\u05d3\u05dc \u05ea\u05d5\u05e8\u05e0\u05d9 \u05ea\u05d5\u05de\u05da \u05d4\u05d5\u05de\u05e1\u05e7\u05d5\u05dc: \u05dc\u05d9\u05de\u05d5\u05d3 \u05d1\u05d5\u05e7\u05e8, \u05e7\u05e9\u05e8 \u05d0\u05d9\u05e9\u05d9, \u05ea\u05e0\u05d5\u05e2\u05d4, \u05de\u05d8\u05e8\u05d5\u05ea, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d5\u05d7\u05e9\u05d9\u05d1\u05d4 \u05e2\u05e6\u05de\u05d0\u05d9\u05ea. \u05d1\u05de\u05e7\u05d1\u05d9\u05dc \u05d0\u05e0\u05d7\u05e0\u05d5 \u05d1\u05d5\u05e0\u05d9\u05dd \u05d0\u05e7\u05d5\u05e1\u05d9\u05e1\u05d8\u05dd \u05e9\u05dc \u05d7\u05d5\u05d2\u05d9\u05dd, \u05ea\u05d5\u05db\u05e0\u05d9\u05d5\u05ea \u05e2\u05e8\u05d1 \u05d5\u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea.',
          actions: [
            { type: 'scroll', target: '#blog', label: '\u05dc\u05e7\u05e8\u05d5\u05d0 \u05e2\u05d5\u05d3' },
            { type: 'scroll', target: '#faq', label: '\u05e9\u05d0\u05dc\u05d5\u05ea' },
            { type: 'link', href: '/signup-he.html', label: '\u05d4\u05e8\u05e9\u05de\u05d4' },
            {
              type: 'path',
              path: 'self_governance',
              label: '\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea',
            },
          ],
        },
        student: {
          body:
            '\u05d0\u05e0\u05d9 \u05d9\u05db\u05d5\u05dc \u05dc\u05e2\u05d6\u05d5\u05e8 \u05dc\u05da \u05dc\u05d7\u05e9\u05d5\u05d1 \u05e2\u05dc \u05de\u05d8\u05e8\u05d4, \u05e1\u05d9\u05d8\u05d5\u05d0\u05e6\u05d9\u05d4 \u05d0\u05d5 \u05e9\u05d0\u05dc\u05d4 \u05d1\u05dc\u05d9\u05de\u05d5\u05d3. \u05d0\u05dc \u05ea\u05e9\u05ea\u05e3 \u05db\u05d0\u05df \u05e4\u05e8\u05d8\u05d9\u05dd \u05e4\u05e8\u05d8\u05d9\u05d9\u05dd. \u05d1\u05de\u05e9\u05d4\u05d5 \u05d7\u05e9\u05d5\u05d1 \u05d0\u05d5 \u05de\u05d1\u05dc\u05d1\u05dc, \u05db\u05d3\u05d0\u05d9 \u05dc\u05e2\u05e8\u05d1 \u05d4\u05d5\u05e8\u05d4, \u05e8\u05d1 \u05d0\u05d5 \u05de\u05d1\u05d5\u05d2\u05e8 \u05e9\u05d0\u05ea\u05d4 \u05e1\u05d5\u05de\u05da \u05e2\u05dc\u05d9\u05d5.',
          actions: [
            { type: 'path', path: 'sodas', label: '\u05dc\u05d7\u05e9\u05d5\u05d1 \u05e2\u05dc \u05de\u05e6\u05d1' },
            { type: 'prefill', label: '\u05dc\u05e2\u05d1\u05d5\u05d3 \u05e2\u05dc \u05de\u05d8\u05e8\u05d4', prompt: '' },
            { type: 'prefill', label: '\u05e9\u05d0\u05dc\u05d4 \u05d1\u05dc\u05d9\u05de\u05d5\u05d3', prompt: '' },
            { type: 'prefill', label: '\u05dc\u05d3\u05d1\u05e8 \u05e2\u05dd \u05de\u05d1\u05d5\u05d2\u05e8', prompt: '' },
          ],
        },
        provider: {
          body:
            '\u05d0\u05e0\u05d7\u05e0\u05d5 \u05d1\u05d5\u05e0\u05d9\u05dd \u05d0\u05e7\u05d5\u05e1\u05d9\u05e1\u05d8\u05dd \u05dc\u05de\u05e9\u05e4\u05d7\u05d5\u05ea: \u05dc\u05d9\u05de\u05d5\u05d3 \u05ea\u05d5\u05e8\u05d4 \u05d1\u05d1\u05d5\u05e7\u05e8, \u05ea\u05d5\u05db\u05e0\u05d9\u05d5\u05ea \u05e2\u05e8\u05d1, \u05dc\u05d9\u05d5\u05d5\u05d9 \u05dc\u05d4\u05d5\u05e8\u05d9\u05dd \u05d5\u05d0\u05d9\u05e0\u05d3\u05e7\u05e1 \u05e9\u05dc \u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea \u05de\u05d4\u05d9\u05de\u05e0\u05d9\u05dd. \u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea \u05d9\u05db\u05d5\u05dc \u05dc\u05d4\u05ea\u05d7\u05d9\u05dc \u05e2\u05dd \u05e4\u05e8\u05d5\u05e4\u05d9\u05dc \u05d7\u05d9\u05e0\u05de\u05d9, \u05d5\u05d1\u05d4\u05de\u05e9\u05da \u05dc\u05e9\u05d3\u05e8\u05d2 \u05dc\u05e9\u05d9\u05d5\u05d5\u05e7, \u05e4\u05d0\u05e0\u05dc, \u05de\u05d5\u05d3\u05e2\u05d5\u05ea, SEO \u05d0\u05d5 \u05e0\u05d5\u05db\u05d7\u05d5\u05ea \u05d5\u05d5\u05d1 \u05d7\u05d6\u05e7\u05d4 \u05d9\u05d5\u05ea\u05e8.',
          actions: [
            {
              type: 'link',
              href: '/become-service-provider?onboard=provider',
              label: '\u05dc\u05d4\u05e6\u05d8\u05e8\u05e3 \u05dc\u05e8\u05e9\u05d9\u05de\u05d4',
            },
            {
              type: 'scroll',
              target: '#learning-ecosystem',
              label: '\u05dc\u05d4\u05d1\u05d9\u05df \u05d0\u05ea \u05d4\u05de\u05d5\u05d3\u05dc',
            },
            { type: 'link', href: whatsappUrl, label: '\u05dc\u05d9\u05e6\u05d5\u05e8 \u05e7\u05e9\u05e8' },
            { type: 'prefill', label: '\u05dc\u05e9\u05dc\u05d5\u05d7 \u05e4\u05e8\u05d8\u05d9\u05dd', prompt: '' },
          ],
        },
        self_governance: {
          body:
            '\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea \u05d4\u05d9\u05d0 \u05dc\u05e2\u05d6\u05d5\u05e8 \u05dc\u05d9\u05dc\u05d3 \u05dc\u05e9\u05d9\u05dd \u05dc\u05d1 \u05de\u05d4 \u05e7\u05d5\u05e8\u05d4 \u05d1\u05e4\u05e0\u05d9\u05dd, \u05dc\u05d4\u05d1\u05d9\u05df \u05d0\u05ea \u05d4\u05d1\u05d7\u05d9\u05e8\u05d5\u05ea \u05e9\u05dc\u05d5, \u05d5\u05dc\u05e7\u05d7\u05ea \u05d1\u05e2\u05dc\u05d5\u05ea \u05e2\u05dc \u05d4\u05e6\u05e2\u05d3 \u05d4\u05d1\u05d0. \u05d6\u05d4 \u05dc\u05d0 "\u05e2\u05d5\u05e9\u05d9\u05dd \u05de\u05d4 \u05e9\u05e8\u05d5\u05e6\u05d9\u05dd". \u05d6\u05d4 \u05d7\u05d5\u05e4\u05e9 \u05e2\u05dd \u05de\u05e1\u05d2\u05e8\u05ea, \u05e7\u05e9\u05e8, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05ea\u05d5\u05e8\u05e0\u05d9\u05ea, \u05d4\u05ea\u05d1\u05d5\u05e0\u05e0\u05d5\u05ea \u05db\u05e0\u05d4, \u05de\u05d8\u05e8\u05d5\u05ea \u05d5\u05de\u05d5\u05d3\u05e2\u05d5\u05ea.',
          actions: [
            { type: 'message', label: '\u05dc\u05d4\u05d5\u05e8\u05d9\u05dd', body: '\u05dc\u05d4\u05d5\u05e8\u05d9\u05dd, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea \u05de\u05ea\u05d7\u05d9\u05dc\u05d4 \u05de\u05e7\u05e9\u05e8, \u05de\u05e1\u05d2\u05e8\u05ea, \u05e6\u05d9\u05e4\u05d9\u05d5\u05ea \u05d1\u05e8\u05d5\u05e8\u05d5\u05ea \u05d5\u05e9\u05d9\u05d7\u05d4 \u05db\u05e0\u05d4. \u05d0\u05d9\u05d6\u05d4 \u05d7\u05dc\u05e7 \u05de\u05d6\u05d4 \u05d0\u05ea\u05dd \u05e8\u05d5\u05e6\u05d9\u05dd \u05dc\u05d9\u05d9\u05e9\u05dd \u05d1\u05d1\u05d9\u05ea?' },
            { type: 'message', label: '\u05dc\u05ea\u05dc\u05de\u05d9\u05d3\u05d9\u05dd', body: '\u05dc\u05ea\u05dc\u05de\u05d9\u05d3, \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea \u05d0\u05d5\u05de\u05e8\u05ea \u05dc\u05e9\u05d9\u05dd \u05dc\u05d1, \u05dc\u05d1\u05d7\u05d5\u05e8 \u05d0\u05ea \u05d4\u05e6\u05e2\u05d3 \u05d4\u05e0\u05db\u05d5\u05df, \u05d5\u05dc\u05e7\u05d7\u05ea \u05d0\u05d7\u05e8\u05d9\u05d5\u05ea. \u05d0\u05d9\u05d6\u05d5 \u05d1\u05d7\u05d9\u05e8\u05d4 \u05d0\u05ea\u05d4 \u05e8\u05d5\u05e6\u05d4 \u05dc\u05d7\u05d6\u05e7 \u05e2\u05db\u05e9\u05d9\u05d5?' },
            { type: 'scroll', target: '#blog', label: '\u05dc\u05e7\u05e8\u05d5\u05d0 \u05e2\u05d5\u05d3' },
            { type: 'prefill', label: '\u05e9\u05d0\u05dc\u05ea \u05d4\u05de\u05e9\u05da', prompt: '' },
          ],
        },
        sodas: {
          messages: [
            'SODAS \u05d4\u05d5\u05d0 \u05de\u05d4\u05dc\u05da \u05e9\u05dc \u05de\u05e6\u05d1, \u05d0\u05e4\u05e9\u05e8\u05d5\u05d9\u05d5\u05ea, \u05d7\u05e1\u05e8\u05d5\u05e0\u05d5\u05ea, \u05d9\u05ea\u05e8\u05d5\u05e0\u05d5\u05ea \u05d5\u05e4\u05ea\u05e8\u05d5\u05df. \u05e7\u05d5\u05d3\u05dd \u05de\u05d1\u05d9\u05e0\u05d9\u05dd \u05de\u05d4 \u05e7\u05e8\u05d4 \u05d5\u05d0\u05d9\u05da \u05d6\u05d4 \u05d4\u05e8\u05d2\u05d9\u05e9, \u05d5\u05e8\u05e7 \u05d0\u05d6 \u05d1\u05d5\u05d7\u05e8\u05d9\u05dd \u05e6\u05e2\u05d3.',
            '\u05d1\u05d5\u05d0\u05d5 \u05e0\u05d0\u05d8 \u05d0\u05ea \u05d6\u05d4. \u05de\u05d4 \u05d4\u05d9\u05d4 \u05d4\u05de\u05e6\u05d1 - \u05de\u05d4 \u05e7\u05e8\u05d4, \u05d5\u05d0\u05d9\u05da \u05d6\u05d4 \u05d4\u05e8\u05d2\u05d9\u05e9 \u05dc\u05d5?',
          ],
          actions: [
            { type: 'sodas_option', label: '\u05d4\u05d5\u05d0 \u05d4\u05d9\u05d4 \u05de\u05ea\u05d5\u05e1\u05db\u05dc', feeling: 'frustrated' },
            { type: 'sodas_option', label: '\u05d4\u05d5\u05d0 \u05d4\u05e8\u05d2\u05d9\u05e9 \u05de\u05d5\u05d1\u05da', feeling: 'embarrassed' },
            { type: 'sodas_option', label: '\u05d4\u05d5\u05d0 \u05db\u05e2\u05e1', feeling: 'angry' },
            { type: 'sodas_option', label: '\u05d4\u05d5\u05d0 \u05e0\u05e1\u05d2\u05e8', feeling: 'shut down' },
            { type: 'prefill', label: '\u05d0\u05e0\u05d9 \u05d0\u05db\u05ea\u05d5\u05d1', prompt: '' },
          ],
        },
        question: {
          body:
            '\u05d1\u05e9\u05de\u05d7\u05d4. \u05db\u05ea\u05d1\u05d5 \u05d0\u05ea \u05d4\u05e9\u05d0\u05dc\u05d4, \u05d5\u05d0\u05e4\u05e9\u05e8 \u05dc\u05db\u05d5\u05d5\u05df \u05dc\u05e8\u05d9\u05e9\u05d5\u05dd, \u05dc\u05de\u05d5\u05d3\u05dc \u05d4\u05dc\u05d9\u05de\u05d5\u05d3, \u05dc\u05d0\u05d7\u05e8\u05d9\u05d5\u05ea \u05d0\u05d9\u05e9\u05d9\u05ea, \u05dc\u05e0\u05d5\u05ea\u05e0\u05d9 \u05e9\u05d9\u05e8\u05d5\u05ea \u05d0\u05d5 \u05dc\u05e9\u05d9\u05d7\u05ea \u05d4\u05d5\u05e8\u05d5\u05ea.',
          actions: [
            { type: 'prefill', label: '\u05dc\u05d4\u05e7\u05dc\u05d9\u05d3 \u05e9\u05d0\u05dc\u05d4', prompt: '' },
            { type: 'path', path: 'signup', label: '\u05e8\u05d9\u05e9\u05d5\u05dd' },
            { type: 'path', path: 'provider', label: '\u05e0\u05d5\u05ea\u05df \u05e9\u05d9\u05e8\u05d5\u05ea' },
            { type: 'path', path: 'sodas', label: 'SODAS' },
          ],
        },
      },
      sodas: {
        nextAfterFeeling:
          '\u05d6\u05d4 \u05e0\u05d5\u05ea\u05df \u05dc\u05e0\u05d5 \u05d0\u05ea \u05d4\u05de\u05e6\u05d1. \u05d0\u05d9\u05dc\u05d5 \u05d1\u05d7\u05d9\u05e8\u05d5\u05ea \u05d4\u05d9\u05d5 \u05dc\u05d5 \u05d1\u05d0\u05d5\u05ea\u05d5 \u05e8\u05d2\u05e2?',
        optionButtons: [
          { type: 'prefill', label: '\u05dc\u05db\u05ea\u05d5\u05d1 \u05d0\u05e4\u05e9\u05e8\u05d5\u05d9\u05d5\u05ea', prompt: '' },
          {
            type: 'message',
            label: '\u05ea\u05df \u05d3\u05d5\u05d2\u05de\u05d0\u05d5\u05ea',
            body:
              '\u05d0\u05e4\u05e9\u05e8\u05d5\u05d9\u05d5\u05ea \u05d9\u05db\u05d5\u05dc\u05d5\u05ea \u05dc\u05d4\u05d9\u05d5\u05ea: \u05dc\u05e2\u05e6\u05d5\u05e8 \u05d5\u05dc\u05e0\u05e9\u05d5\u05dd, \u05dc\u05d1\u05e7\u05e9 \u05e2\u05d6\u05e8\u05d4, \u05dc\u05d4\u05e9\u05ea\u05de\u05e9 \u05d1\u05de\u05d9\u05dc\u05d9\u05dd, \u05dc\u05e7\u05d7\u05ea \u05de\u05e8\u05d7\u05e7, \u05dc\u05ea\u05e7\u05df \u05d0\u05ea \u05de\u05d4 \u05e9\u05e7\u05e8\u05d4 \u05d0\u05d5 \u05dc\u05e0\u05e1\u05d5\u05ea \u05e9\u05d5\u05d1. \u05d0\u05d9\u05dc\u05d5 \u05d0\u05e4\u05e9\u05e8\u05d5\u05d9\u05d5\u05ea \u05de\u05ea\u05d0\u05d9\u05de\u05d5\u05ea \u05db\u05d0\u05df?',
          },
        ],
      },
      safety:
        '\u05d6\u05d4 \u05e0\u05e9\u05de\u05e2 \u05db\u05de\u05d5 \u05de\u05e6\u05d1 \u05e9\u05d9\u05db\u05d5\u05dc \u05dc\u05d4\u05d9\u05d5\u05ea \u05e7\u05e9\u05d5\u05e8 \u05dc\u05d1\u05d8\u05d9\u05d7\u05d5\u05ea \u05d0\u05d5 \u05dc\u05e4\u05d2\u05d9\u05e2\u05d4. \u05d1\u05d1\u05e7\u05e9\u05d4 \u05e2\u05e8\u05d1\u05d5 \u05de\u05d1\u05d5\u05d2\u05e8 \u05d0\u05de\u05d9\u05df \u05e2\u05db\u05e9\u05d9\u05d5, \u05d5\u05d0\u05dd \u05de\u05d9\u05e9\u05d4\u05d5 \u05d1\u05e1\u05db\u05e0\u05d4 \u05e4\u05e0\u05d5 \u05dc\u05e2\u05d6\u05e8\u05d4 \u05de\u05e7\u05d5\u05de\u05d9\u05ea \u05d3\u05d7\u05d5\u05e4\u05d4. \u05d0\u05d9\u05d6\u05d4 \u05de\u05d1\u05d5\u05d2\u05e8 \u05d9\u05db\u05d5\u05dc \u05dc\u05d4\u05d9\u05d5\u05ea \u05e2\u05dd \u05d4\u05d9\u05dc\u05d3 \u05e2\u05db\u05e9\u05d9\u05d5?',
    },
  };

  window.BNAHelperKnowledge = {
    version: '2026-06-15-helper-bot-landing-sodas',
    snippets: {
      selfGovernance:
        'Self-governance is freedom with structure: a child learns to notice choices, own consequences, connect Torah to real decisions, and build internal motivation.',
      jewishUnschooling:
        'BNA treats Jewish unschooling as relationship-based Torah learning with goals, accountability, curiosity, movement, and parent partnership.',
      noShame:
        'The BNA model avoids using bribery, coercion, or shame as the primary educational engine.',
      providerEcosystem:
        'The provider ecosystem connects homeschool families with evening programs, chugim, support services, and future provider profiles.',
      sodas:
        'SODAS guides reflection through Situation, Options, Disadvantages, Advantages, and Solution.',
    },
    get(lang) {
      return helperData[lang === 'he' ? 'he' : 'en'];
    },
  };
})();
