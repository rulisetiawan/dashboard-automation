package mqtt

import (
	"context"
	"fmt"
	"log"
	"time"

	paho "github.com/eclipse/paho.mqtt.golang"
	"pt_smm_scada_ingest/internal/config"
	"pt_smm_scada_ingest/internal/db"
	"pt_smm_scada_ingest/internal/ingest"
)

type Subscriber struct {
	client paho.Client
	cfg    *config.Config
	db     *db.Database
}

func NewSubscriber(cfg *config.Config, database *db.Database) *Subscriber {
	s := &Subscriber{
		cfg: cfg,
		db:  database,
	}

	opts := paho.NewClientOptions()
	opts.AddBroker(cfg.MQTTBroker)
	opts.SetClientID(cfg.MQTTClientID)
	if cfg.MQTTUsername != "" {
		opts.SetUsername(cfg.MQTTUsername)
		opts.SetPassword(cfg.MQTTPassword)
	}

	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(3 * time.Second)
	opts.SetKeepAlive(30 * time.Second)
	opts.SetPingTimeout(10 * time.Second)

	opts.SetOnConnectHandler(func(c paho.Client) {
		log.Printf("[INFO] Connected to MQTT broker: %s", cfg.MQTTBroker)
		token := c.Subscribe(cfg.MQTTTopic, cfg.MQTTQoS, s.handleMessage)
		if token.Wait() && token.Error() != nil {
			log.Printf("[ERROR] Failed to subscribe to topic '%s': %v", cfg.MQTTTopic, token.Error())
		} else {
			log.Printf("[INFO] Subscribed to topic: %s (QoS %d)", cfg.MQTTTopic, cfg.MQTTQoS)
		}
	})

	opts.SetConnectionLostHandler(func(c paho.Client, err error) {
		log.Printf("[WARN] Lost connection to MQTT broker: %v (reconnecting...)", err)
	})

	opts.SetReconnectingHandler(func(c paho.Client, options *paho.ClientOptions) {
		log.Printf("[INFO] Reconnecting to MQTT broker...")
	})

	s.client = paho.NewClient(opts)
	return s
}

func (s *Subscriber) Start() error {
	log.Printf("[INFO] Connecting to MQTT broker at %s ...", s.cfg.MQTTBroker)
	token := s.client.Connect()
	if token.Wait() && token.Error() != nil {
		return fmt.Errorf("connect to mqtt broker: %w", token.Error())
	}
	return nil
}

func (s *Subscriber) Stop() {
	if s.client != nil && s.client.IsConnected() {
		log.Printf("[INFO] Unsubscribing from %s ...", s.cfg.MQTTTopic)
		s.client.Unsubscribe(s.cfg.MQTTTopic)
		s.client.Disconnect(250)
		log.Printf("[INFO] MQTT subscriber stopped cleanly.")
	}
}

func (s *Subscriber) handleMessage(client paho.Client, msg paho.Message) {
	topic := msg.Topic()
	payload := msg.Payload()

	assetID := ingest.ExtractAssetFromTopic(topic)

	samples, err := ingest.ParseMessage(payload, assetID)
	if err != nil {
		log.Printf("[WARN] Failed to parse message from topic %s: %v", topic, err)
		return
	}

	if len(samples) == 0 {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	inserted, err := s.db.IngestBatch(ctx, samples)
	if err != nil {
		log.Printf("[ERROR] Database ingest failed for topic %s: %v", topic, err)
		return
	}

	log.Printf("[INFO] Topic %s: received %d sample(s), inserted %d new to telemetry_sample",
		topic, len(samples), inserted)
}
