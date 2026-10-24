// ... existing code ...
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            fontSize: 12.5,
                            padding: "8px 10px",
                            background: COLORS.bg,
                            borderRadius: 6,
                            lineHeight: 1.4,
                          }}
                        >
                          <div>{n.text}</div>
                          <div style={{ fontSize: 11, color: COLORS.faint, marginTop: 3 }}>{n.time}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>

          {isMobile && page === "home" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 8, marginTop: 8 }}>
// ... existing code ...
