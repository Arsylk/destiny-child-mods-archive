const fs = require('fs'),
      path = require('path'),
      md5File = require('md5-file').sync,
      characters = require('../src/data/characters.json'),
      modHashes = require('../data/mod-hashes.json')

Object.keys(characters).forEach(code => {
  characters[code] = characters[code] || {}
  characters[code].code = characters[code].code || code
  characters[code].variants = characters[code].variants || {}
  // characters[code].variants[variant] = characters[code].variants[variant] || {}
  // characters[code].variants[variant].mods = characters[code].variants[variant].mods || []
})


// update mod hashes seen
const charactersPath = path.join(__dirname, '../docs/characters')
fs.readdirSync(charactersPath).forEach(charDir => {
  const [code, variant] = charDir.split('_'),
  charPath = path.join(charactersPath, charDir)
  fs.readdirSync(charPath).forEach(modHash => {
    characters[code] = characters[code] || {}
    characters[code].code = characters[code].code || code
    characters[code].variants = characters[code].variants || {}
    characters[code].variants[variant] = characters[code].variants[variant] || {}
    characters[code].variants[variant].mods = characters[code].variants[variant].mods || []
    // if(!characters[code].variants[variant].mods.find(({hash}) => hash == modHash)) {
    //   characters[code].variants[variant].mods.push({hash: modHash})
    // }
    modHashes.pck[modHash] = modHashes.pck[modHash] || {code, variant, created: Date.now()}
    const modPath = path.join(charPath, modHash)
    if(code.match(/^s(c|m)/) && fs.existsSync(path.join(modPath, '00000002'))) {
      fs.renameSync(path.join(modPath, '00000002'), path.join(modPath, 'physics.json'))
    }
    const textureHash = code + '_' + variant + '-' + fs.readdirSync(modPath).reduce((acc, file) => {
      if(file.match(/^texture.+\.png/)) acc += md5File(path.join(modPath, file))
      return acc
    }, '')
    // if(fs.existsSync(path.join(modPath, 'static.png')))
    //   fs.unlinkSync(path.join(modPath, 'static.png'))
    modHashes.texture[textureHash] = true
  })
})

// const findVariant = (hash, character) => {
//   var variant
//   Object.keys(character.variants).forEach(vid => {
//     if(character.variants[vid].mods.indexOf(hash) > -1)
//       variant = vid
//   })
//   return variant
// }

// const findChild = hash => {
//   var character
//   Object.keys(characters).forEach(code => {
//     Object.keys(characters[code].variants).forEach(variant => {
//       if(characters[code].variants[variant].mods.indexOf(hash) > -1)
//         character = characters[code]
//     })
//   })
//   return character
// }

// Object.keys(modHashes.pck).forEach(hash => {
//   const character = findChild(hash)
//   if(character) {
//     const variant = findVariant(hash, character)

// // Object.keys(modHashes.pck).forEach(hash => {
// //   const {variant, code} = modHashes.pck[hash] || {}
// //   if(code) {
//     // const variant = findVariant(hash, character)
//     // modHashes.pck[hash] = {
//     //   code: character.code,
//     //   variant,
//     //   created: fs.statSync(path.join(__dirname, '../docs/characters/' + character.code + '_' + variant + '/' + hash))
//     // }
//     const stat = fs.statSync(path.join(__dirname, '../docs/characters/' + character.code + '_' + variant + '/' + hash))
//     const created = new Date(stat.birthtime).getTime()
//     console.log(modHashes.pck[hash])
//     modHashes.pck[hash] = typeof modHashes.pck[hash] == 'object' ? modHashes.pck[hash] : {code: character.code, variant, created}
//     modHashes.pck[hash].created = created
//   }
// })

console.log('updating created times')
Object.keys(characters).forEach(code => {
  Object.keys(characters[code].variants).forEach(variant => {
    characters[code].variants[variant].mods = characters[code].variants[variant].mods
      .map(hash => typeof hash == 'string' ? {hash} : hash)
      .map(mod => Object.assign(mod, {created: modHashes.pck[mod.hash] ? modHashes.pck[mod.hash].created : 0}))
  })
})
fs.writeFileSync(path.join(__dirname, '../src/data/characters.json'), JSON.stringify(characters, null, 2))
fs.writeFileSync(path.join(__dirname, '../data/mod-hashes.json'), JSON.stringify(modHashes, null, 2))