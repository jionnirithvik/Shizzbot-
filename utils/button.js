/**
 * Interactive Button Utility for WhatsApp Bot
 * Provides reusable functionality for creating and sending interactive buttons
 */

/**
 * Create a button object
 * @param {string} buttonId - Unique identifier for the button
 * @param {string} displayText - Text to display on the button
 * @param {number} type - Button type (default: 1)
 * @returns {Object} Button object
 */
export function createButton(buttonId, displayText, type = 1) {
    return {
        buttonId,
        buttonText: { displayText },
        type
    };
}

/**
 * Create multiple buttons from an array of button data
 * @param {Array} buttonData - Array of objects with {id, text, type?} properties
 * @returns {Array} Array of button objects
 */
export function createButtons(buttonData) {
    return buttonData.map(btn => createButton(btn.id, btn.text, btn.type || 1));
}

/**
 * Create a complete button message object
 * @param {Object} options - Message options
 * @param {string|Object} options.image - Image URL or buffer
 * @param {string} options.caption - Message caption
 * @param {string} options.footer - Message footer
 * @param {Array} options.buttons - Array of button objects
 * @param {number} options.headerType - Header type (default: 1)
 * @param {boolean} options.viewOnce - View once setting (default: true)
 * @returns {Object} Complete button message object
 */
export function createButtonMessage({
    image,
    caption,
    footer,
    buttons,
    headerType = 1,
    viewOnce = true
}) {
    const message = {
        caption,
        footer,
        buttons,
        headerType,
        viewOnce
    };

    // Handle image input - can be URL string or buffer/path object
    if (typeof image === 'string') {
        message.image = { url: image };
    } else if (image) {
        message.image = image;
    }

    return message;
}

/**
 * Send a button message using the WhatsApp socket
 * @param {Object} sock - WhatsApp socket instance
 * @param {string} jid - Chat JID to send message to
 * @param {Object} buttonMessage - Button message object
 * @param {Object} options - Additional options (quoted, etc.)
 * @returns {Promise} Send message promise
 */
export async function sendButtonMessage(sock, jid, buttonMessage, options = {}) {
    try {
        return await sock.sendMessage(jid, buttonMessage, options);
    } catch (error) {
        console.error('Error sending button message:', error);
        // Fallback to regular text message if buttons fail
        const fallbackMessage = {
            text: buttonMessage.caption + (buttonMessage.footer ? `\n\n${buttonMessage.footer}` : '')
        };
        if (buttonMessage.image) {
            fallbackMessage.image = buttonMessage.image;
        }
        return await sock.sendMessage(jid, fallbackMessage, options);
    }
}

/**
 * Create a menu button message with predefined structure
 * @param {Object} options - Menu options
 * @param {string} options.title - Menu title
 * @param {string} options.description - Menu description
 * @param {string} options.imageUrl - Menu image URL
 * @param {Array} options.menuItems - Array of menu items {id, text}
 * @param {string} options.footerText - Footer text
 * @returns {Object} Menu button message object
 */
export function createMenuButtonMessage({
    title,
    description,
    imageUrl,
    menuItems = [],
    footerText = 'Select an option below'
}) {
    const buttons = createButtons(menuItems);
    
    return createButtonMessage({
        image: imageUrl,
        caption: `*${title}*\n\n${description}`,
        footer: footerText,
        buttons,
        headerType: 1,
        viewOnce: true
    });
}

/**
 * Handle button response/callback
 * @param {Object} message - Received message object
 * @param {Function} callback - Callback function to execute
 * @returns {Promise} Callback execution result
 */
export async function handleButtonResponse(message, callback) {
    try {
        // Check if message contains button response
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const displayText = message.message.buttonsResponseMessage.selectedDisplayText;
            
            return await callback({
                buttonId,
                displayText,
                message
            });
        }
        
        // Check for list response (alternative button format)
        if (message.message?.listResponseMessage) {
            const listResponse = message.message.listResponseMessage;
            return await callback({
                buttonId: listResponse.singleSelectReply?.selectedRowId,
                displayText: listResponse.title,
                message
            });
        }
        
        return null;
    } catch (error) {
        console.error('Error handling button response:', error);
        return null;
    }
}

export default {
    createButton,
    createButtons,
    createButtonMessage,
    sendButtonMessage,
    createMenuButtonMessage,
    handleButtonResponse
};