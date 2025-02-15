import { Box, Container, Grid, Typography, Card, CardContent } from "@mui/material";
import { Favorite, Chat, PeopleAlt } from "@mui/icons-material";

const features = [
  { icon: <PeopleAlt fontSize="large" />, title: "Follow Friends", description: "Connect with people you care about." },
  { icon: <Favorite fontSize="large" />, title: "Like Posts", description: "Engage with content that matters." },
  { icon: <Chat fontSize="large" />, title: "Real-Time Chat", description: "Stay connected with your network." },
];

export const FeaturesSection = () => (
  <Container sx={{ py: 8 }}>
    <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
      Key Features
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ textAlign: "center", p: 3, borderRadius: "15px" }}>
            <CardContent>
              <Box sx={{ fontSize: 50, color: "#1DA1F2" }}>{feature.icon}</Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
);
