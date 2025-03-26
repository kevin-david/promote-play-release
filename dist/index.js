import './sourcemap-register.cjs';/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

var __createBinding = (undefined && undefined.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (undefined && undefined.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (undefined && undefined.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = cleanup;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const androidpublisher_1 = require("@googleapis/androidpublisher");
let serviceAccountFile = './serviceAccountJson.json';
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Code initially taken from https://github.com/boswelja/promote-play-beta-action
            const packageName = core.getInput('package-name', { required: true });
            const rawServiceAccountJson = core.getInput('service-account-json-raw', {
                required: true
            });
            const inAppUpdatePriority = parseInt(core.getInput('inapp-update-priority'));
            const userFraction = parseFloat(core.getInput('user-fraction'));
            const fromTrack = core.getInput('from-track');
            const toTrack = core.getInput('to-track');
            core.debug('Writing service account JSON to file, setting env variable so auth can find it');
            yield fs.promises.writeFile(serviceAccountFile, rawServiceAccountJson, {
                encoding: 'utf8'
            });
            serviceAccountFile = yield fs.promises.realpath(serviceAccountFile);
            core.exportVariable('GOOGLE_APPLICATION_CREDENTIALS', serviceAccountFile);
            core.debug('Authenticating: creating auth client');
            const authClient = new androidpublisher_1.auth.GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/androidpublisher']
            });
            const publisher = (0, androidpublisher_1.androidpublisher)('v3');
            core.info('Creating a new app edit');
            const appEdit = yield publisher.edits.insert({
                packageName,
                auth: authClient
            });
            const appEditId = appEdit.data.id;
            if (!appEditId) {
                throw new Error(`appEditId is not defined. Data: ${appEdit.data}`);
            }
            core.info(`Getting current ${fromTrack} info`);
            const sourceTrack = yield publisher.edits.tracks.get({
                auth: authClient,
                packageName,
                editId: appEditId,
                track: fromTrack
            });
            core.debug(`Mapping ${fromTrack} releases to target releases`);
            core.debug(`Applying new fraction ${userFraction}, new priority ${inAppUpdatePriority}`);
            const sourceReleases = sourceTrack.data.releases;
            if (!sourceReleases) {
                throw new Error(`sourceReleases is not defined. Data: ${sourceTrack.data}`);
            }
            const toTrackReleases = sourceReleases.map(release => {
                release.inAppUpdatePriority = inAppUpdatePriority;
                if (userFraction === 1.0) {
                    // Assume this release is completed, and fully roll it out
                    release.status = 'completed';
                }
                else {
                    // See https://developers.google.com/android-publisher/api-ref/rest/v3/edits.tracks#status
                    // The API requires us to explicitly set this for some reason
                    // Otherwise, you get an error: `Error: Release status must be specified.`
                    release.userFraction = userFraction;
                    release.status = 'inProgress';
                }
                return release;
            });
            core.info(`Switching ${fromTrack} release to ${toTrack}`);
            yield publisher.edits.tracks.update({
                auth: authClient,
                editId: appEditId,
                track: toTrack,
                packageName,
                requestBody: {
                    track: toTrack,
                    releases: toTrackReleases
                }
            });
            core.info('Committing changes');
            const commitResult = yield publisher.edits.commit({
                auth: authClient,
                editId: appEditId,
                packageName
            });
            // Check commit was successful
            if (!commitResult.data.id) {
                throw new Error(`Error ${commitResult.status}: ${commitResult.statusText}`);
            }
            core.info(`Successfully promoted release to ${toTrack}`);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.promises.unlink(serviceAccountFile);
    });
}
run();


//# sourceMappingURL=index.js.map