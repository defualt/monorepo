import ensureLeadingSlash from '@defualt/ensure-leading-slash';


export default function({app, nameSpace='junk-express'})  {
  app.get(ensureLeadingSlash(`${nameSpace}/junk-express`),(req, res) => {
      res.send({
          status:"success",
      })
  });
}

