import { json } from "react-router-dom"

interface Extractor {
    eName: string
    mainUrl: string
    extract: (link: string) => Promise<Video>
}

type Video = {
    source: string,
    subtitles: string[],
    headers: any,
}


const Service = {
    get: async (link: string, referer: string = "", options: any = {}): Promise<Document | null> => {
        try {
            const response = await fetch(
                link,
                {
                    method: 'GET',
                    headers: {
                    'referer': referer,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
                    },
                    ...options
                }
            );

            console.log(response)
            // Check if the response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            const charset = contentType.includes('charset=') 
                ? contentType.split('charset=')[1] 
                : 'UTF-8';

            const text = await response.text();
            let doc;

            if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
                // Parse as XML
                const parser = new DOMParser();
                doc = parser.parseFromString(text, 'application/xml');
            } else {
                // Parse as HTML
                const parser = new DOMParser();
                doc = parser.parseFromString(text, 'text/html');
            }

            return doc;
        } catch (error) {
            console.error('Error fetching or parsing the document:', error);
            return null;
        }
    }
}

export const VidSrcNetExtractor: Extractor = {
    
    eName: "Vidsrc.net",
    mainUrl: "https://vidsrc.net",
    extract: async (link: string): Promise<Video>  => {
        const html = await Service.get(link)
        const parser = new DOMParser();
        const htmldoc = parser.parseFromString(html.documentElement.outerHTML, "text/html");

        const iframe = htmldoc.querySelector('iframe#player_iframe');
        const src = iframe?.getAttribute('src');
        if (!src) {
            throw new Error("Can't retrieve rcp");
        }
        const iframedoc = src.startsWith('//') ? `https:${src}` : src;
        const doc = await Service.get(iframedoc, link)
        const rcpregex = /src: '\/prorcp\/(.*?)'/;
        const matchrcp = doc.documentElement.outerHTML.match(rcpregex);
        const prorcp = iframedoc.split('/rcp')[0] + '/prorcp/' + matchrcp[1];
        if (!prorcp) {
            throw new Error("Can't retrieve prorcp")
        }
        const script = await Service.get(prorcp, iframedoc)
        const playerregex = /Playerjs.*file: ([a-zA-Z0-9]*?) ,/;

        console.log("iframedoc", iframedoc)
        console.log("prorcp", prorcp)
        console.log("script", script)

        const matchplayer = script?.documentElement?.outerHTML?.match(playerregex);
        const playerId = matchplayer?.at(1);

        if (!playerId) {
            throw new Error("Can't retrieve player ID")
        }
 
        const regex = new RegExp(`<div id="${playerId}" style="display:none;">\\s*(.*?)\\s*</div>`, 's');
        const match = script.documentElement.outerHTML.match(regex);

        const encryptedSource = match[1].trim();

        if (!encryptedSource) {
            throw new Error("Can't retrieve encrypted source");
        }
        return {
            source: decrypt(playerId, encryptedSource),
            subtitles: [],
            headers: {
                "Referer": iframedoc
            },
        }
    }
}

function decrypt(id: string, encrypted: string): string {
    // Define a mapping of IDs to their respective decryption functions
    const decryptionFunctions: { [key: string]: (encrypted: string) => string } = {
      "NdonQLf1Tzyx7bMG": NdonQLf1Tzyx7bMG,
      "sXnL9MQIry": sXnL9MQIry,
      "IhWrImMIGL": IhWrImMIGL,
      "xTyBxQyGTA": xTyBxQyGTA,
      "ux8qjPHC66": ux8qjPHC66,
      "eSfH1IRMyL": eSfH1IRMyL,
      "KJHidj7det": KJHidj7det,
      "o2VSUnjnZl": o2VSUnjnZl,
      "Oi3v1dAlaM": Oi3v1dAlaM,
      "TsA2KGDGux": TsA2KGDGux,
      "JoAHUMCLXV": JoAHUMCLXV,
    };
  
    // Retrieve the decryption function for the given ID
    const decryptFunction = decryptionFunctions[id];
  
    // If no function is found, throw an error
    if (!decryptFunction) {
      throw new Error(`Encryption type not implemented yet: ${id}`);
    }
  
    // Call the decryption function with the encrypted value
    return decryptFunction(encrypted);
  }

function NdonQLf1Tzyx7bMG(a: string): string {
    const b = 3
    const c: string[] = []
    for (let d = 0; d < a.length; d+=b) {
        c.push(a.substring(d, Math.min(d + b, a.length)))
    }
    return c.reverse().join("")
}

function sXnL9MQIry(a: string): string {
    const b = "pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u";
    // Convert each hex pair in `a` to a character
    const d = Array.from({ length: a.length / 2 }, (_, i) => 
      String.fromCharCode(parseInt(a.slice(i * 2, i * 2 + 2), 16))
    ).join("");
    // XOR each character in `d` with `b` and build string `c`
    let c = "";
    for (let e = 0; e < d.length; e++) {
      c += String.fromCharCode(d.charCodeAt(e) ^ b.charCodeAt(e % b.length));
    }
    // Subtract 3 from each character code in `c` to get string `e`
    let e = "";
    for (const ch of c) {
      e += String.fromCharCode(ch.charCodeAt(0) - 3);
    }
    // Decode `e` from Base64
    return Buffer.from(e, 'base64').toString('utf-8');
  }

  function IhWrImMIGL(a: string): string {
    // Reverse the input string
    const b = a.split("").reverse().join("");
  
    // Apply ROT13 to each character in `b`
    const c = b.split("").map(ch => {
      if ((ch >= 'a' && ch <= 'm') || (ch >= 'A' && ch <= 'M')) {
        return String.fromCharCode(ch.charCodeAt(0) + 13);
      } else if ((ch >= 'n' && ch <= 'z') || (ch >= 'N' && ch <= 'Z')) {
        return String.fromCharCode(ch.charCodeAt(0) - 13);
      } else {
        return ch;
      }
    }).join("");
  
    // Reverse the result of ROT13 transformation
    const d = c.split("").reverse().join("");
  
    // Decode the final result from Base64
    return Buffer.from(d, 'base64').toString('utf-8');
  }

  function xTyBxQyGTA(a: string): string {
    // Reverse the input string
    const b = a.split("").reverse().join("");
  
    // Filter out characters at odd indices
    const c = b.split("").filter((_, index) => index % 2 === 0).join("");
  
    // Decode the filtered string from Base64 and return as UTF-8
    return Buffer.from(c, 'base64').toString('utf-8');
  }

  function ux8qjPHC66(a: string): string {
    // Reverse the input string
    const b = a.split("").reverse().join("");
  
    const c = "X9a(O;FMV2-7VO5x;Ao\u0005:dN1NoFs?j,";
    
    // Convert the reversed string from hex to characters
    const d = Array.from({ length: b.length / 2 }, (_, i) => 
      String.fromCharCode(parseInt(b.slice(i * 2, i * 2 + 2), 16))
    ).join("");
  
    // XOR operation
    let e = "";
    for (let i = 0; i < d.length; i++) {
      e += String.fromCharCode(d.charCodeAt(i) ^ c.charCodeAt(i % c.length));
    }
  
    return e;
  }

  function eSfH1IRMyL(a: string): string {
    // Reverse the input string
    const b = a.split("").reverse().join("");
  
    // Decrement the character codes by 1 and join into a string
    const c = b.split("").map(ch => String.fromCharCode(ch.charCodeAt(0) - 1)).join("");
  
    // Convert the modified string from hex to characters
    const d = Array.from({ length: c.length / 2 }, (_, i) => 
      String.fromCharCode(parseInt(c.slice(i * 2, i * 2 + 2), 16))
    ).join("");
  
    return d;
  }

  function KJHidj7det(a: string): string {
    // Extract the substring from index 10 to length - 16
    const b = a.substring(10, a.length - 16);
    const c = "3SAY~#%Y(V%>5d/Yg\"$G[Lh1rK4a;7ok";
  
    // Decode the Base64 string
    const d = Buffer.from(b, 'base64').toString('utf-8');
  
    // Repeat string `c` to match the length of `d`
    const e = c.repeat(Math.ceil(d.length / c.length)).substring(0, d.length);
  
    // XOR operation
    let f = "";
    for (let i = 0; i < d.length; i++) {
      f += String.fromCharCode(d.charCodeAt(i) ^ e.charCodeAt(i));
    }
  
    return f;
  }

  function o2VSUnjnZl(a: string): string {
    const shift = 3;
  
    return a.split("").map(char => {
      if (char >= 'a' && char <= 'z') {
        const shifted = char.charCodeAt(0) - shift;
        return String.fromCharCode(shifted < 'a'.charCodeAt(0) ? shifted + 26 : shifted);
      } else if (char >= 'A' && char <= 'Z') {
        const shifted = char.charCodeAt(0) - shift;
        return String.fromCharCode(shifted < 'A'.charCodeAt(0) ? shifted + 26 : shifted);
      } else {
        return char;
      }
    }).join("");
  }
  
  function Oi3v1dAlaM(a: string): string {
    const b = a.split("").reverse().join("");
    const c = b.replace(/-/g, "+").replace(/_/g, "/");
    const d = Buffer.from(c, 'base64').toString('utf-8');
    const f = 5;
    
    let e = "";
    for (const ch of d) {
      e += String.fromCharCode(ch.charCodeAt(0) - f);
    }
    return e;
  }
  
  function TsA2KGDGux(a: string): string {
    const b = a.split("").reverse().join("");
    const c = b.replace(/-/g, "+").replace(/_/g, "/");
    const d = Buffer.from(c, 'base64').toString('utf-8');
    const f = 7;
    
    let e = "";
    for (const ch of d) {
      e += String.fromCharCode(ch.charCodeAt(0) - f);
    }
    return e;
  }
  
  function JoAHUMCLXV(a: string): string {
    const b = a.split("").reverse().join("");
    const c = b.replace(/-/g, "+").replace(/_/g, "/");
    const d = Buffer.from(c, 'base64').toString('utf-8');
    const f = 3;
  
    let e = "";
    for (const ch of d) {
      e += String.fromCharCode(ch.charCodeAt(0) - f);
    }
    return e;
  }