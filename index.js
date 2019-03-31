// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Axios = require('axios');

const SKILL_NAME = 'まねネコ';
const GREET_MESSAGE = `${SKILL_NAME} にようこそ${addNya()}。`;
const HELP_MESSAGE = `このスキルでは、ハニャしかけた言葉をネコ口調で真似して返す${addNya()}。`;
const HELP_MESSAGE2 = `ハニャしかけたあとは聞き取り状態ににゃるので連続でハニャしてほしい${addNya()}。`;
const REPROMPT_MESSAGE = 'なんかハニャしてみるニャ？';

const API_URL = 'https://labs.goo.ne.jp/api/hiragana';
const API_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const OUTPUT_TYPE = 'hiragana';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = GREET_MESSAGE + HELP_MESSAGE + HELP_MESSAGE2 + REPROMPT_MESSAGE;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const NekoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'NekoIntent';
    },
    async handle(handlerInput) {
        console.log("NekoIntentHandler called");
        const slot = handlerInput.requestEnvelope.request.intent.slots.user_say_slot;
        if (slot && slot.value) {
            let user_say = slot.value;
            console.log(`user_saying: ${user_say}`);
                      
            user_say = user_say.replace(/長眺め/, 'なが眺め');

            try {
                const res = await Axios.post(API_URL,{
                    app_id: API_KEY,
                    output_type: OUTPUT_TYPE,
                    sentence: user_say
                });
                const kana = res.data.converted;
                console.log(`user_saying_kana: "${kana}"`);
    
                const speechText = hito2neko(kana);
                console.log(`neko_saying: ${speechText}`);

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(REPROMPT_MESSAGE)
                    .getResponse();
            } catch (error) {
                throw new Error(`http get error: ${error}`);
            }

        } else {
            throw new Error("unknown slot value.");
        }
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = HELP_MESSAGE + HELP_MESSAGE2 + REPROMPT_MESSAGE;
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = `また遊んでほしい${addNya()}！また${addNya()}！`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `にゃに言っているかわかんにゃい${addNya()}、もう一回ハニャしてみる${addNya()}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        NekoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();

function addNya(){
    const gobi = ['ニャン', 'ニャ', 'ニャー'];
    return gobi[Math.floor(Math.random() * gobi.length)]
}

function hito2neko(value) {
    let string = "";
    string = value
        .replace(/な/g, 'ニャ')
        .replace(/(です|でした|だ|だった)(ね)$/, "$1");
    if (!string.match(/(ニャ|ニャン|ニャー)$/)){
        string += addNya();
    }
    return string;
}