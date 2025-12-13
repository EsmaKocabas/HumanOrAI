it("should return 3 model predictions", async () => {
    const res = await request(app)
      .post("/api/predict")
      .send({ text: "Sample abstract text" });
  
    expect(res.body).toHaveProperty("model_1");
    expect(res.body).toHaveProperty("model_2");
    expect(res.body).toHaveProperty("model_3");
  });
  