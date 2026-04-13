export default async function handler(req, res) {
  const token = process.env.SUPERHERO_TOKEN; // variável de ambiente no Vercel
  const { id } = req.query; // exemplo: /api/proxy?id=1

  try {
    const response = await fetch(`https://superheroapi.com/api.php/${token}/${id}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar herói" });
  }
}