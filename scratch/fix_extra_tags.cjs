const fs = require('fs');
const file = 'grand-store/frontend/src/components/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `              </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>`;

const replacement = `              </AnimatePresence>
            </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed!");
