// patch-react-quill.ts
// Replace React Quill's DOMNodeInserted with MutationObserver
import Quill from 'quill';

// Save original React Quill function that uses DOMNodeInserted
const OriginalEditor = Quill.import('modules/clipboard') as any;

class PatchedClipboard extends OriginalEditor {
    constructor(quill: any, options: any) {
        super(quill, options);

        // Remove any legacy DOMNodeInserted listeners
        this.quill.root.removeEventListener('DOMNodeInserted', () => { });

        // Use MutationObserver for future-proof handling
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // You can handle added nodes here if needed
                    // console.log('Node added:', mutation.addedNodes);
                }
            });
        });

        observer.observe(this.quill.root, {
            childList: true,
            subtree: true,
        });
    }
}

// Patch Quill
Quill.register('modules/clipboard', PatchedClipboard, true);
